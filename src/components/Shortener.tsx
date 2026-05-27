"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Link2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Trash2,
  Search,
  Calendar,
  Tag,
  Download,
  Loader2,
} from "lucide-react";
import type { ShortLink } from "@/types";
import { useLinks } from "@/components/providers/LinksProvider";
import { buildShortUrl, isExpired } from "@/lib/links";
import { DEFAULT_OPTIONS, toPngDataUrl } from "@/lib/qr";
import { downloadPng } from "@/lib/download";
import { Card, SectionLabel } from "@/components/ui/Card";
import { cn, timeAgo, truncate } from "@/lib/utils";

type StatusFilter = "all" | "active" | "expired";

export function Shortener() {
  const { links, addLink, removeLink } = useLinks();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ShortLink | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const today = new Date().toISOString().split("T")[0];

  function handleGenerate() {
    if (busy) return;
    setBusy(true);
    const expiresAt = expiry
      ? new Date(`${expiry}T23:59:59`).getTime()
      : null;
    const res = addLink({ url, alias: alias || undefined, expiresAt });
    if (!res.ok) {
      toast.error(res.error);
      setBusy(false);
      return;
    }
    setResult(res.link);
    setUrl("");
    setAlias("");
    setExpiry("");
    toast.success("Short link created");
    setTimeout(() => setBusy(false), 250);
  }

  // Live QR preview for the freshly created link.
  useEffect(() => {
    if (!result) return;
    let active = true;
    toPngDataUrl(buildShortUrl(result.code), {
      ...DEFAULT_OPTIONS,
      size: 240,
    })
      .then((png) => active && setQr(png))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [result]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links.filter((l) => {
      const matches =
        !q ||
        l.url.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q);
      const expired = isExpired(l);
      const statusOk =
        filter === "all" ||
        (filter === "active" && !expired) ||
        (filter === "expired" && expired);
      return matches && statusOk;
    });
  }, [links, search, filter]);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(buildShortUrl(code));
      toast.success("Short URL copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  async function downloadQr(code: string) {
    try {
      await downloadPng(buildShortUrl(code), {
        ...DEFAULT_OPTIONS,
        size: 480,
      });
    } catch {
      toast.error("QR export failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Short Links
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Shorten, share, <span className="text-gradient">and track</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Turn long URLs into tidy short links with optional custom aliases,
          expiry dates, click analytics, and an instant QR code.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="space-y-5">
            <div>
              <label htmlFor="long" className="mb-2 block text-sm font-semibold">
                Long URL
              </label>
              <div className="relative">
                <Link2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="long"
                  type="text"
                  inputMode="url"
                  placeholder="https://example.com/very/long/path?with=params"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="field pl-11"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <SectionLabel>Custom alias (optional)</SectionLabel>
                <div className="relative">
                  <Tag
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    placeholder="my-link"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="field pl-10"
                  />
                </div>
              </div>
              <div>
                <SectionLabel>Expiry date (optional)</SectionLabel>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="date"
                    min={today}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="field pl-10"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={busy}
              className="btn-primary w-full"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              Shorten URL
            </button>
          </Card>
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <Card className="flex h-full flex-col">
            {result ? (
              <div className="flex flex-1 flex-col">
                <SectionLabel>Your short link</SectionLabel>
                <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2/50 px-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink">
                    {buildShortUrl(result.code)}
                  </span>
                  <button
                    onClick={() => copy(result.code)}
                    className="btn-icon h-9 w-9"
                    aria-label="Copy"
                  >
                    <Copy size={15} />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={`/s/${result.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost flex-1"
                  >
                    <ExternalLink size={15} /> Open / Test
                  </a>
                  <button
                    onClick={() => downloadQr(result.code)}
                    className="btn-ghost flex-1"
                  >
                    <Download size={15} /> QR
                  </button>
                </div>

                <div className="mt-4 grid flex-1 place-items-center rounded-2xl border border-line bg-white p-4">
                  {qr ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={qr} alt="QR code" className="w-40 rounded-lg" />
                  ) : (
                    <div className="h-40 w-40 animate-pulse rounded-lg bg-surface-2" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center text-muted">
                <span className="grid h-16 w-16 place-items-center rounded-3xl border border-dashed border-line">
                  <QrCode size={28} className="opacity-50" />
                </span>
                <p className="max-w-[220px] text-sm">
                  Your shortened link and its QR code will appear here.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* History */}
      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold">
            History{" "}
            <span className="text-sm font-normal text-muted">
              ({filtered.length})
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search links…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field w-48 py-2 pl-9 text-sm"
              />
            </div>
            <div className="flex rounded-xl border border-line bg-surface-2/50 p-1">
              {(["all", "active", "expired"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    filter === f
                      ? "bg-surface text-ink shadow-soft"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface-2/30 px-4 py-10 text-center text-sm text-muted">
            No links yet — shorten your first URL above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Short / Original</th>
                  <th className="px-4 py-3 font-semibold">Clicks</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Last click</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const expired = isExpired(l);
                  return (
                    <tr key={l.id} className="border-t border-line align-middle">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium text-ink">/{l.code}</p>
                        <p className="text-xs text-muted">
                          {truncate(l.url.replace(/^https?:\/\//, ""), 40)}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium">{l.clicks}</td>
                      <td className="px-4 py-3 text-muted">
                        {timeAgo(l.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {l.lastAccessed ? timeAgo(l.lastAccessed) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            expired
                              ? "bg-rose-500/15 text-rose-500"
                              : "bg-brand/15 text-brand",
                          )}
                        >
                          {expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Action label="Copy" onClick={() => copy(l.code)}>
                            <Copy size={14} />
                          </Action>
                          <a
                            href={`/s/${l.code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-icon h-8 w-8"
                            aria-label="Open"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <Action label="QR" onClick={() => downloadQr(l.code)}>
                            <QrCode size={14} />
                          </Action>
                          <Action
                            label="Delete"
                            onClick={() => removeLink(l.id)}
                          >
                            <Trash2 size={14} />
                          </Action>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Action({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="btn-icon h-8 w-8"
    >
      {children}
    </button>
  );
}
