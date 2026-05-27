import type { ShortLink } from "@/types";
import { getSupabase } from "./client";
import { makeCode } from "@/lib/links";

interface DbRow {
  id: string;
  code: string;
  url: string;
  title: string | null;
  owner: string | null;
  created_at: string;
  expires_at: string | null;
  clicks: number;
  last_accessed: string | null;
}

function toLink(r: DbRow): ShortLink {
  return {
    id: r.id,
    code: r.code,
    url: r.url,
    title: r.title ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
    expiresAt: r.expires_at ? new Date(r.expires_at).getTime() : null,
    clicks: r.clicks,
    lastAccessed: r.last_accessed ? new Date(r.last_accessed).getTime() : null,
  };
}

export interface CreateInput {
  url: string;
  alias?: string;
  expiresAt?: number | null;
  title?: string;
  owner: string;
}
export type CreateResult =
  | { ok: true; link: ShortLink }
  | { ok: false; error: string };

/** Fetch the links created by this browser (owner-scoped). */
export async function remoteFetch(owner: string): Promise<ShortLink[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("links")
    .select("*")
    .eq("owner", owner)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error || !data) return [];
  return (data as DbRow[]).map(toLink);
}

/** Insert a new link; relies on the unique `code` constraint for aliases. */
export async function remoteCreate(input: CreateInput): Promise<CreateResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase not configured." };

  const expires = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;
  let attempts = 0;

  while (true) {
    const code = input.alias?.trim() || makeCode();
    const { data, error } = await sb
      .from("links")
      .insert({
        code,
        url: input.url,
        owner: input.owner,
        title: input.title ?? null,
        expires_at: expires,
      })
      .select()
      .single();

    if (!error && data) return { ok: true, link: toLink(data as DbRow) };

    // 23505 = unique violation on `code`.
    if (error?.code === "23505") {
      if (input.alias) return { ok: false, error: "That alias is already taken." };
      if (++attempts > 5)
        return { ok: false, error: "Could not generate a unique code." };
      continue; // retry with a fresh random code
    }
    return { ok: false, error: error?.message || "Failed to create link." };
  }
}

export async function remoteDelete(id: string, owner: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("links").delete().eq("id", id).eq("owner", owner);
}

export async function remoteClear(owner: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("links").delete().eq("owner", owner);
}

export type ResolveResult =
  | { status: "ok"; url: string }
  | { status: "expired" }
  | { status: "notfound" };

/**
 * Resolve a code and atomically record a click. Runs server-side in the
 * /s/[code] route so links work from ANY device.
 */
export async function remoteResolve(code: string): Promise<ResolveResult> {
  const sb = getSupabase();
  if (!sb) return { status: "notfound" };

  const { data, error } = await sb
    .from("links")
    .select("url, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return { status: "notfound" };
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { status: "expired" };
  }

  // Fire the atomic counter (don't block the redirect on failure).
  try {
    await sb.rpc("increment_click", { p_code: code });
  } catch {
    /* counting is best-effort */
  }
  return { status: "ok", url: data.url as string };
}
