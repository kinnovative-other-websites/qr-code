"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ShortLink } from "@/types";
import {
  aliasTaken,
  loadLinks,
  makeCode,
  saveLinks,
} from "@/lib/links";
import { validateUrl } from "@/lib/validation";
import { uid } from "@/lib/utils";

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
  addLink: (input: AddInput) => AddResult;
  removeLink: (id: string) => void;
  clearLinks: () => void;
  refresh: () => void;
}

const LinksContext = createContext<LinksContextValue | null>(null);

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLinks(loadLinks());
    setReady(true);

    // Keep state fresh when a click is recorded in the /s/[code] tab,
    // or when returning to this tab.
    const sync = () => setLinks(loadLinks());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const persist = useCallback((next: ShortLink[]) => {
    setLinks(next);
    saveLinks(next);
  }, []);

  const addLink = useCallback(
    (input: AddInput): AddResult => {
      const { valid, normalized, message } = validateUrl(input.url);
      if (!valid) return { ok: false, error: message ?? "Invalid URL" };

      const current = loadLinks();
      let code = input.alias?.trim();
      if (code) {
        if (!/^[a-zA-Z0-9_-]{3,32}$/.test(code)) {
          return {
            ok: false,
            error: "Alias must be 3–32 letters, numbers, - or _.",
          };
        }
        if (aliasTaken(code, current)) {
          return { ok: false, error: "That alias is already taken." };
        }
      } else {
        do {
          code = makeCode();
        } while (aliasTaken(code, current));
      }

      const link: ShortLink = {
        id: uid(),
        code,
        url: normalized,
        title: input.title?.trim() || undefined,
        createdAt: Date.now(),
        expiresAt: input.expiresAt ?? null,
        clicks: 0,
        lastAccessed: null,
      };
      persist([link, ...current]);
      return { ok: true, link };
    },
    [persist],
  );

  const removeLink = useCallback(
    (id: string) => persist(loadLinks().filter((l) => l.id !== id)),
    [persist],
  );

  const clearLinks = useCallback(() => persist([]), [persist]);
  const refresh = useCallback(() => setLinks(loadLinks()), []);

  const value = useMemo(
    () => ({ links, ready, addLink, removeLink, clearLinks, refresh }),
    [links, ready, addLink, removeLink, clearLinks, refresh],
  );

  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>;
}

export function useLinks() {
  const ctx = useContext(LinksContext);
  if (!ctx) throw new Error("useLinks must be used within <LinksProvider>");
  return ctx;
}
