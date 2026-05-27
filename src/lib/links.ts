import { customAlphabet } from "nanoid";
import type { ShortLink } from "@/types";

const KEY = "qr-studio:links:v1";
const MAX = 300;

// URL-safe, unambiguous alphabet (no look-alike chars).
const nano = customAlphabet(
  "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
  7,
);

export function makeCode(): string {
  return nano();
}

export function loadLinks(): ShortLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLinks(links: ShortLink[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(links.slice(0, MAX)));
  } catch {
    /* storage unavailable */
  }
}

export function isExpired(link: ShortLink): boolean {
  return !!link.expiresAt && Date.now() > link.expiresAt;
}

export function findByCode(code: string): ShortLink | null {
  return loadLinks().find((l) => l.code === code) ?? null;
}

export function aliasTaken(alias: string, links = loadLinks()): boolean {
  const a = alias.toLowerCase();
  return links.some((l) => l.code.toLowerCase() === a);
}

/** Record a click against a code and persist (used by the redirect route). */
export function recordClick(code: string): ShortLink | null {
  const links = loadLinks();
  const idx = links.findIndex((l) => l.code === code);
  if (idx === -1) return null;
  const link = links[idx];
  if (isExpired(link)) return link;
  links[idx] = { ...link, clicks: link.clicks + 1, lastAccessed: Date.now() };
  saveLinks(links);
  return links[idx];
}

/** Absolute short URL for display/copy (client-side only). */
export function buildShortUrl(code: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://qrstudio.app";
  return `${origin}/s/${code}`;
}
