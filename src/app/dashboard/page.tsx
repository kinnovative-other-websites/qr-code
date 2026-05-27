import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { RecentQRCodes } from "@/components/dashboard/RecentQRCodes";


export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "QR and short-link analytics, recent items, most-used links, bulk generation, and CSV export.",
  alternates: { canonical: "/dashboard" },
};

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Your QR <span className="text-gradient">command center</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Everything you&apos;ve created &mdash; QR codes and short links &mdash; with
          analytics, most-used links, bulk tools, and one-click CSV export.
        </p>
      </header>

      <div className="space-y-12">
        <Section eyebrow="QR analytics" title="Generation activity">
          <AnalyticsDashboard />
        </Section>

        <Section eyebrow="Link analytics" title="Short-link performance">
          <LinksPanel />
        </Section>

        <Section eyebrow="Library" title="Recently generated">
          <RecentQRCodes />
        </Section>
        
      </div>
    </div>
  );
}
