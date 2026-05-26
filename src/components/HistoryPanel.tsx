"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, RotateCcw, Trash2, X, Link2 } from "lucide-react";
import type { HistoryItem } from "@/types";
import { SectionLabel } from "@/components/ui/Card";
import { timeAgo, truncate } from "@/lib/utils";

interface Props {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onRestore, onRemove, onClear }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <History size={16} className="text-brand" />
          Recent codes
        </span>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface-2/30 px-4 py-6 text-center text-sm text-muted">
          Generated codes will be saved here on your device.
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface-2/40 p-2.5 transition-colors hover:border-brand/40"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: item.options.bgColor }}
                >
                  <Link2 size={15} style={{ color: item.options.fgColor }} />
                </span>
                <button
                  onClick={() => onRestore(item)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium">
                    {truncate(item.url.replace(/^https?:\/\//, ""), 34)}
                  </p>
                  <p className="text-xs text-muted">{timeAgo(item.createdAt)}</p>
                </button>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onRestore(item)}
                    aria-label="Restore"
                    className="btn-icon h-8 w-8"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label="Remove"
                    className="btn-icon h-8 w-8"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
