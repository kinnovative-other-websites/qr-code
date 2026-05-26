"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { UploadCloud, FileSpreadsheet, Package, Loader2, Download } from "lucide-react";
import type { BulkRow } from "@/types";
import { Card, SectionLabel } from "@/components/ui/Card";
import { DEFAULT_OPTIONS } from "@/lib/qr";
import { downloadBatchZip } from "@/lib/download";
import { validateUrl } from "@/lib/validation";
import { truncate } from "@/lib/utils";

export function BulkGenerator() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");

  function handleFile(file: File) {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: BulkRow[] = [];
        res.data.forEach((cols, idx) => {
          const first = (cols[0] ?? "").trim();
          if (!first) return;
          // skip an obvious header row
          if (idx === 0 && /url|link|website/i.test(first) && !first.includes("."))
            return;
          const { valid } = validateUrl(first);
          parsed.push({
            url: first,
            label: (cols[1] ?? "").trim() || first,
            status: valid ? "pending" : "error",
            error: valid ? undefined : "Invalid URL",
          });
        });
        if (parsed.length === 0) {
          toast.error("No valid rows found in the CSV.");
          return;
        }
        setRows(parsed);
        toast.success(`Loaded ${parsed.length} rows`);
      },
      error: () => toast.error("Could not read the CSV file."),
    });
  }

  async function generateAll() {
    const valid = rows.filter((r) => r.status !== "error");
    if (valid.length === 0) {
      toast.error("No valid URLs to generate.");
      return;
    }
    setProgress({ done: 0, total: valid.length });
    try {
      await downloadBatchZip(
        valid.map((r) => ({ url: r.url, label: r.label })),
        { ...DEFAULT_OPTIONS, fgColor: fg, bgColor: bg, logo: null },
        (done, total) => setProgress({ done, total }),
      );
      setRows((prev) =>
        prev.map((r) => (r.status === "error" ? r : { ...r, status: "done" })),
      );
      toast.success(`Generated ${valid.length} QR codes`);
    } catch {
      toast.error("Bulk generation failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
          <Package size={18} />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">Bulk generation</h3>
          <p className="text-sm text-muted">
            Upload a CSV (<span className="font-mono">url, label</span>) to
            export a ZIP of codes.
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {rows.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-surface-2/40 px-6 py-10 text-muted transition-colors hover:border-brand/50 hover:text-ink"
        >
          <UploadCloud size={30} />
          <span className="text-sm font-medium">Click to upload a CSV file</span>
          <span className="text-xs">Each row becomes one QR code</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <ColorMini label="Foreground" value={fg} onChange={setFg} />
            <ColorMini label="Background" value={bg} onChange={setBg} />
            <button
              onClick={() => fileRef.current?.click()}
              className="ml-auto text-xs text-muted hover:text-ink"
            >
              Replace file
            </button>
          </div>

          <div className="max-h-64 overflow-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Label</th>
                  <th className="px-4 py-2.5 font-semibold">URL</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2.5">{truncate(r.label, 22)}</td>
                    <td className="px-4 py-2.5 text-muted">
                      {truncate(r.url, 30)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={generateAll}
            disabled={!!progress}
            className="btn-primary w-full"
          >
            {progress ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {progress.done}/{progress.total}
              </>
            ) : (
              <>
                <Download size={18} />
                Generate & download ZIP
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
}

function ColorMini({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      {label}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: BulkRow["status"] }) {
  const map = {
    pending: "bg-surface-2 text-muted",
    done: "bg-brand/15 text-brand",
    error: "bg-rose-500/15 text-rose-500",
  } as const;
  const label = { pending: "Ready", done: "Done", error: "Invalid" } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}
