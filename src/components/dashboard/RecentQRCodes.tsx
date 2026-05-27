"use client";

import { useEffect, useState } from "react";
import { FileDown, QrCode } from "lucide-react";
import type { HistoryItem } from "@/types";
import { loadHistory } from "@/lib/storage";
import { DEFAULT_OPTIONS, toPngDataUrl } from "@/lib/qr";
import { exportQrCsv } from "@/lib/csv";
import { Card } from "@/components/ui/Card";
import { timeAgo, truncate } from "@/lib/utils";

export function RecentQRCodes() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    const history = loadHistory().slice(0, 8);
    setItems(history);
    let active = true;
    (async () => {
      const entries = await Promise.all(
        history.map(async (h) => {
          const png = await toPngDataUrl(h.url, {
            ...DEFAULT_OPTIONS,
            ...h.options,
            entity: "none",
            size: 120,
          });
          return [h.id, png] as const;
        }),
      );
      if (active) setThumbs(Object.fromEntries(entries));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <QrCode size={18} className="text-brand" /> Recent QR codes
        </h3>
        {items.length > 0 && (
          <button
            onClick={() => exportQrCsv(loadHistory())}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink"
          >
            <FileDown size={14} /> Export CSV
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface-2/30 px-4 py-8 text-center text-sm text-muted">
          No QR codes yet — generate one on the QR Generator page.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((h) => (
            <div
              key={h.id}
              className="group rounded-2xl border border-line bg-surface-2/40 p-3 transition-all hover:-translate-y-1 hover:border-brand/40"
            >
              <div className="mb-2 grid aspect-square place-items-center rounded-xl bg-white p-2">
                {thumbs[h.id] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={thumbs[h.id]} alt={h.url} className="w-full rounded" />
                ) : (
                  <div className="h-full w-full animate-pulse rounded bg-surface-2" />
                )}
              </div>
              <p className="truncate text-xs font-medium">
                {truncate(h.url.replace(/^https?:\/\//, ""), 18)}
              </p>
              <p className="text-[11px] text-muted">{timeAgo(h.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
