import type { HistoryItem } from "@/types";

const KEY = "qr-studio:history:v1";
const MAX = 50;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

export function addHistory(item: HistoryItem): HistoryItem[] {
  const existing = loadHistory().filter((i) => i.url !== item.url);
  const next = [item, ...existing].slice(0, MAX);
  saveHistory(next);
  return next;
}

export function removeHistory(id: string): HistoryItem[] {
  const next = loadHistory().filter((i) => i.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): HistoryItem[] {
  saveHistory([]);
  return [];
}
