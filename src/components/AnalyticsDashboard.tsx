"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QrCode, ScanLine, TrendingUp, Globe } from "lucide-react";
import type { HistoryItem } from "@/types";
import { loadHistory } from "@/lib/storage";
import { Card } from "@/components/ui/Card";

const BRAND = "#0d9488";
const ACCENT = "#0ea5e9";
const PIE_COLORS = ["#0d9488", "#0ea5e9", "#6366f1", "#f59e0b", "#ec4899", "#84cc16"];

export function AnalyticsDashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const scans = history.reduce((s, h) => s + h.scans, 0);
    const weekAgo = Date.now() - 7 * 86400000;
    const thisWeek = history.filter((h) => h.createdAt >= weekAgo).length;

    // 7-day time series
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const next = d.getTime() + 86400000;
      const count = history.filter(
        (h) => h.createdAt >= d.getTime() && h.createdAt < next,
      ).length;
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        count,
      };
    });

    // top domains
    const domainMap = new Map<string, number>();
    history.forEach((h) => {
      try {
        const host = new URL(h.url).hostname.replace(/^www\./, "");
        domainMap.set(host, (domainMap.get(host) ?? 0) + 1);
      } catch {
        /* ignore */
      }
    });
    const domains = Array.from(domainMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { total, scans, thisWeek, days, domains };
  }, [history]);

  if (!mounted) return null;

  const cards = [
    { label: "Codes generated", value: stats.total, icon: QrCode },
    { label: "Total interactions", value: stats.scans, icon: ScanLine },
    { label: "Created this week", value: stats.thisWeek, icon: TrendingUp },
    { label: "Unique domains", value: stats.domains.length, icon: Globe },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon size={17} />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h3 className="mb-1 font-display text-lg font-semibold">
            Activity — last 7 days
          </h3>
          <p className="mb-4 text-sm text-muted">QR codes created per day.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.days} margin={{ left: -24, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--line))",
                    borderRadius: 12,
                    color: "rgb(var(--ink))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={BRAND}
                  strokeWidth={2.5}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-1 font-display text-lg font-semibold">Top domains</h3>
          <p className="mb-4 text-sm text-muted">Distribution of your links.</p>
          {stats.domains.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              No data yet — generate a few codes first.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.domains}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {stats.domains.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
                {stats.domains.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-muted">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <p className="text-center text-xs text-muted">
        Analytics reflect codes generated on this device.{" "}
        <span className="text-ink/70">
          Live scan tracking & dynamic redirects require the optional backend
        </span>{" "}
        (see README).
      </p>
    </div>
  );
}
