import Papa from "papaparse";
import { saveAs } from "file-saver";
import type { HistoryItem, ShortLink } from "@/types";
import { buildShortUrl } from "./links";

function iso(ts: number | null | undefined): string {
  return ts ? new Date(ts).toISOString() : "";
}

export function exportLinksCsv(links: ShortLink[]) {
  const rows = links.map((l) => ({
    code: l.code,
    short_url: buildShortUrl(l.code),
    original_url: l.url,
    clicks: l.clicks,
    created: iso(l.createdAt),
    last_accessed: iso(l.lastAccessed),
    expires: iso(l.expiresAt),
  }));
  download(Papa.unparse(rows), "short-links");
}

export function exportQrCsv(history: HistoryItem[]) {
  const rows = history.map((h) => ({
    url: h.url,
    entity: h.options.entity ?? "none",
    interactions: h.scans,
    created: iso(h.createdAt),
  }));
  download(Papa.unparse(rows), "qr-history");
}

function download(csv: string, name: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${name}-${Date.now()}.csv`);
}
