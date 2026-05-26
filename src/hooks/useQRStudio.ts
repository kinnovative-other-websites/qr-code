"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { HistoryItem, QROptions } from "@/types";
import { DEFAULT_OPTIONS, toPngDataUrl, toSvgString } from "@/lib/qr";
import { validateUrl } from "@/lib/validation";
import {
  addHistory,
  clearHistory,
  loadHistory,
  removeHistory,
} from "@/lib/storage";
import { uid } from "@/lib/utils";

export interface GeneratedResult {
  url: string;
  png: string;
  svg: string;
  options: QROptions;
}

export function useQRStudio() {
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState<QROptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const liveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    setHistory(loadHistory());
  }, []);

  const patchOptions = useCallback((patch: Partial<QROptions>) => {
    setOptions((prev) => ({ ...prev, ...patch }));
  }, []);

  /** Generate and persist to history. */
  const generate = useCallback(async () => {
    const { valid, normalized, message } = validateUrl(url);
    if (!valid) {
      toast.error(message ?? "Invalid URL");
      return;
    }

    setLoading(true);
    try {
      const [png, svg] = await Promise.all([
        toPngDataUrl(normalized, options),
        toSvgString(normalized, options),
      ]);
      setResult({ url: normalized, png, svg, options });

      const item: HistoryItem = {
        id: uid(),
        url: normalized,
        createdAt: Date.now(),
        options,
        scans: 0,
        dynamic: false,
      };
      setHistory(addHistory(item));
      toast.success("QR code generated");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to generate QR code",
      );
    } finally {
      // Keep the loader visible long enough to feel intentional.
      setTimeout(() => setLoading(false), 350);
    }
  }, [url, options]);

  /**
   * Live re-render of the preview when options change after a code already
   * exists — debounced so dragging sliders stays smooth.
   */
  useEffect(() => {
    if (!result) return;
    if (liveTimer.current) clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(async () => {
      try {
        const [png, svg] = await Promise.all([
          toPngDataUrl(result.url, options),
          toSvgString(result.url, options),
        ]);
        setResult((r) => (r ? { ...r, png, svg, options } : r));
      } catch {
        /* ignore transient render errors while editing */
      }
    }, 120);
    return () => {
      if (liveTimer.current) clearTimeout(liveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const restore = useCallback((item: HistoryItem) => {
    setUrl(item.url);
    setOptions(item.options);
    setHistory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, scans: i.scans + 1 } : i)),
    );
    toast("Loaded from history");
  }, []);

  const remove = useCallback((id: string) => {
    setHistory(removeHistory(id));
  }, []);

  const clearAll = useCallback(() => {
    setHistory(clearHistory());
    toast("History cleared");
  }, []);

  return {
    url,
    setUrl,
    options,
    setOptions,
    patchOptions,
    result,
    loading,
    generate,
    history,
    restore,
    remove,
    clearAll,
    mounted,
  };
}
