"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ShortLink } from "@/types";
import { aliasTaken, loadLinks, makeCode, saveLinks } from "@/lib/links";
import { validateUrl } from "@/lib/validation";
import { uid } from "@/lib/utils";
import { supabaseEnabled } from "@/lib/supabase/client";
import {
  remoteClear,
  remoteCreate,
  remoteDelete,
  remoteFetch,
} from "@/lib/supabase/links";
import { getOwnerId } from "@/lib/owner";

interface AddInput {
  url: string;
  alias?: string;
  expiresAt?: number | null;
  title?: string;
}
type AddResult = { ok: true; link: ShortLink } | { ok: false; error: string };

interface LinksContextValue {
  links: ShortLink[];
  ready: boolean;
  /** true when links are stored in Supabase (resolvable from any device) */
  remote: boolean;
  addLink: (input: AddInput) => Promise<AddResult>;
  removeLink: (id: string) => Promise<void>;
  clearLinks: () => Promise<void>;
  refresh: () => void;
}

const LinksContext = createContext<LinksContextValue | null>(null);
const ALIAS_RE = /^[a-zA-Z0-9_-]{3,32}$/;

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [ready, setReady] = useState(false);
  const owner = useRef("");

  const refresh = useCallback(() => {
    if (supabaseEnabled) {
      remoteFetch(owner.current).then(setLinks).catch(() => {});
    } else {
      setLinks(loadLinks());
    }
  }, []);

  useEffect(() => {
    owner.current = getOwnerId();

    if (supabaseEnabled) {
      remoteFetch(owner.current)
        .then(setLinks)
        .catch(() => {})
        .finally(() => setReady(true));
    } else {
      setLinks(loadLinks());
      setReady(true);
    }

    // Refresh counts when returning to the tab; in local mode also react to
    // cross-tab storage writes from the /s/[code] redirect.
    const sync = () => refresh();
    window.addEventListener("focus", sync);
    if (!supabaseEnabled) window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [refresh]);

  const validate = useCallback(
    (input: AddInput) => {
      const { valid, normalized, message } = validateUrl(input.url);
      if (!valid) return { error: message ?? "Invalid URL" };
      const alias = input.alias?.trim();
      if (alias && !ALIAS_RE.test(alias)) {
        return { error: "Alias must be 3–32 letters, numbers, - or _." };
      }
      return { normalized, alias };
    },
    [],
  );

  const addLink = useCallback(
    async (input: AddInput): Promise<AddResult> => {
      const v = validate(input);
      if (v.error) return { ok: false, error: v.error };
      const url = v.normalized as string;
      const alias = v.alias;

      if (supabaseEnabled) {
        const res = await remoteCreate({
          url,
          alias,
          expiresAt: input.expiresAt ?? null,
          title: input.title,
          owner: owner.current,
        });
        if (res.ok) setLinks((prev) => [res.link, ...prev]);
        return res;
      }

      // Local fallback
      const current = loadLinks();
      let code = alias;
      if (code) {
        if (aliasTaken(code, current))
          return { ok: false, error: "That alias is already taken." };
      } else {
        do {
          code = makeCode();
        } while (aliasTaken(code, current));
      }
      const link: ShortLink = {
        id: uid(),
        code,
        url,
        title: input.title?.trim() || undefined,
        createdAt: Date.now(),
        expiresAt: input.expiresAt ?? null,
        clicks: 0,
        lastAccessed: null,
      };
      const next = [link, ...current];
      setLinks(next);
      saveLinks(next);
      return { ok: true, link };
    },
    [validate],
  );

  const removeLink = useCallback(async (id: string) => {
    if (supabaseEnabled) {
      await remoteDelete(id, owner.current);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } else {
      const next = loadLinks().filter((l) => l.id !== id);
      setLinks(next);
      saveLinks(next);
    }
  }, []);

  const clearLinks = useCallback(async () => {
    if (supabaseEnabled) {
      await remoteClear(owner.current);
    } else {
      saveLinks([]);
    }
    setLinks([]);
  }, []);

  const value = useMemo(
    () => ({
      links,
      ready,
      remote: supabaseEnabled,
      addLink,
      removeLink,
      clearLinks,
      refresh,
    }),
    [links, ready, addLink, removeLink, clearLinks, refresh],
  );

  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>;
}

export function useLinks() {
  const ctx = useContext(LinksContext);
  if (!ctx) throw new Error("useLinks must be used within <LinksProvider>");
  return ctx;
}
