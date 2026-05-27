"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2, Wand2 } from "lucide-react";
import type { QROptions, QRErrorLevel } from "@/types";
import { TEMPLATES } from "@/lib/share";
import { SectionLabel } from "@/components/ui/Card";
import { EntityFramePicker } from "@/components/EntityFramePicker";
import { cn } from "@/lib/utils";

interface Props {
  options: QROptions;
  patch: (p: Partial<QROptions>) => void;
}

const FG_SWATCHES = ["#0f172a", "#000000", "#0d9488", "#be123c", "#6d28d9", "#1d4ed8"];
const BG_SWATCHES = ["#ffffff", "#f0fdfa", "#fff1f2", "#f5f3ff", "#f8fafc", "#fefce8"];
const LEVELS: { value: QRErrorLevel; label: string }[] = [
  { value: "L", label: "Low" },
  { value: "M", label: "Medium" },
  { value: "Q", label: "Quartile" },
  { value: "H", label: "High" },
];

function ColorRow({
  label,
  value,
  swatches,
  onChange,
}: {
  label: string;
  value: string;
  swatches: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-2 py-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent p-0"
            aria-label={`${label} color picker`}
          />
          <span className="font-mono text-xs uppercase text-muted">{value}</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {swatches.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-label={`Use ${c}`}
            style={{ background: c }}
            className={cn(
              "h-7 w-7 rounded-lg border transition-transform hover:scale-110",
              value.toLowerCase() === c.toLowerCase()
                ? "ring-2 ring-brand ring-offset-2 ring-offset-surface"
                : "border-line",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function CustomizationPanel({ options, patch }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Logo must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch({ logo: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-7">
      {/* Entity frame */}
      <EntityFramePicker options={options} patch={patch} />

      {/* Templates */}
      <div>
        <SectionLabel>Branded templates</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.slice(0, 6).map((t) => (
            <button
              key={t.id}
              onClick={() => patch(t.options)}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface-2/50 p-2.5 transition-all hover:-translate-y-0.5 hover:border-brand/50"
              title={t.description}
            >
              <span
                className="h-8 w-8 rounded-lg border border-line/50"
                style={{ background: t.options.bgColor }}
              >
                <span
                  className="m-1 block h-6 w-6 rounded"
                  style={{ background: t.options.fgColor }}
                />
              </span>
              <span className="text-[11px] font-medium text-muted group-hover:text-ink">
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <SectionLabel>Size — {options.size}px</SectionLabel>
        <input
          type="range"
          min={160}
          max={640}
          step={16}
          value={options.size}
          onChange={(e) => patch({ size: Number(e.target.value) })}
          className="w-full accent-brand"
        />
      </div>

      {/* Corner radius */}
      <div>
        <SectionLabel>Corner radius — {options.cornerRadius}px</SectionLabel>
        <input
          type="range"
          min={0}
          max={48}
          step={4}
          value={options.cornerRadius}
          onChange={(e) => patch({ cornerRadius: Number(e.target.value) })}
          className="w-full accent-brand"
        />
      </div>

      {/* Colors */}
      <ColorRow
        label="Foreground"
        value={options.fgColor}
        swatches={FG_SWATCHES}
        onChange={(fgColor) => patch({ fgColor })}
      />
      <ColorRow
        label="Background"
        value={options.bgColor}
        swatches={BG_SWATCHES}
        onChange={(bgColor) => patch({ bgColor })}
      />

      {/* Error correction */}
      <div>
        <SectionLabel>Error correction</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => patch({ errorLevel: l.value })}
              className={cn(
                "rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                options.errorLevel === l.value
                  ? "border-brand bg-brand/10 text-ink"
                  : "border-line bg-surface-2/50 text-muted hover:text-ink",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <SectionLabel>Center logo</SectionLabel>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onLogo}
          className="hidden"
        />
        {options.logo ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={options.logo}
                alt="Logo preview"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="flex-1 text-sm text-muted">Logo added</span>
              <button
                onClick={() => patch({ logo: null })}
                className="btn-icon h-9 w-9"
                aria-label="Remove logo"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div>
              <SectionLabel>
                Logo size — {Math.round(options.logoScale * 100)}%
              </SectionLabel>
              <input
                type="range"
                min={0.12}
                max={0.3}
                step={0.01}
                value={options.logoScale}
                onChange={(e) =>
                  patch({ logoScale: Number(e.target.value) })
                }
                className="w-full accent-brand"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/40 px-4 py-5 text-sm text-muted transition-colors hover:border-brand/50 hover:text-ink"
          >
            <ImagePlus size={18} />
            Upload a logo (PNG, JPG, SVG)
          </button>
        )}
        {options.logo && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Wand2 size={12} className="text-brand" />
            Error correction auto-boosted to High for scannability.
          </p>
        )}
      </div>
    </div>
  );
}
