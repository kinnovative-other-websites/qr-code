"use client";

import type { QROptions } from "@/types";
import { ENTITY_OPTIONS, frameAccent, getFrame } from "@/lib/frames";
import { SectionLabel } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Props {
  options: QROptions;
  patch: (p: Partial<QROptions>) => void;
}

export function EntityFramePicker({ options, patch }: Props) {
  const active = getFrame(options);

  return (
    <div>
      <SectionLabel>Entity frame</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {ENTITY_OPTIONS.map((o) => (
          <button
            key={o.id}
            // Reset any color override when switching entity.
            onClick={() => patch({ entity: o.id, frameColor: null })}
            className={cn(
              "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
              options.entity === o.id
                ? "border-brand bg-brand/10 text-ink"
                : "border-line bg-surface-2/50 text-muted hover:text-ink",
            )}
          >
            {o.name}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted">{active.description}</p>
          <div className="flex items-center justify-between rounded-2xl border border-line bg-surface-2/50 px-3 py-2.5">
            <span className="text-sm font-medium">Frame color</span>
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={frameAccent(options)}
                onChange={(e) => patch({ frameColor: e.target.value })}
                className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent p-0"
                aria-label="Frame accent color"
              />
              <span className="font-mono text-xs uppercase text-muted">
                {frameAccent(options)}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
