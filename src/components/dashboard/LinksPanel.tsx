"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Link2,
  MousePointerClick,
  Activity,
  FileDown,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { useLinks } from "@/components/providers/LinksProvider";
import { buildShortUrl, isExpired } from "@/lib/links";
import { exportLinksCsv } from "@/lib/csv";
import { Card } from "@/components/ui/Card";
import { timeAgo, truncate } from "@/lib/utils";

export function LinksPanel() {
  const { links } = useLinks();

  const { totalClicks, active, top, recent } = useMemo(() => {
    const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
    const active = links.filter((l) => !isExpired(l)).length;
    const top = [...links]
      .filter((l) => l.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
    const recent = links.slice(0, 6);
    return { totalClicks, active, top, recent };
  }, [links]);

  const metrics = [
    { label: "Short links", value: links.length, icon: Link2 },
    { label: "Total clicks", value: totalClicks, icon: MousePointerClick },
    { label: "Active links", value: active, icon: Activity },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon size={17} />
            </span>
            <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Recent links */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Link2 size={18} className="text-brand" /> Recent short links
            </h3>
            {links.length > 0 && (
              <button
                onClick={() => exportLinksCsv(links)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-ink"
              >
                <FileDown size={14} /> Export CSV
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-surface-2/30 px-4 py-8 text-center text-sm text-muted">
              No links yet.{" "}
              <Link href="/shorten" className="text-brand hover:underline">
                Create one
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/40 p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Link2 size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium">
                      /{l.code}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {truncate(l.url.replace(/^https?:\/\//, ""), 34)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{l.clicks}</p>
                    <p className="text-[11px] text-muted">{timeAgo(l.createdAt)}</p>
                  </div>
                  <a
                    href={`/s/${l.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-icon h-8 w-8 shrink-0"
                    aria-label="Open"
                  >
                    <ExternalLink size={14} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Most used */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <TrendingUp size={18} className="text-brand" /> Most used
          </h3>
          {top.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-surface-2/30 px-4 py-8 text-center text-sm text-muted">
              Clicks will rank your links here.
            </p>
          ) : (
            <ol className="space-y-3">
              {top.map((l, i) => {
                const max = top[0].clicks || 1;
                return (
                  <li key={l.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-mono">
                        <span className="text-muted">{i + 1}.</span>/{l.code}
                      </span>
                      <span className="font-semibold">{l.clicks}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${(l.clicks / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
