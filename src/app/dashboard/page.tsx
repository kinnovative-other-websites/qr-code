import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BulkGenerator } from "@/components/BulkGenerator";
import { TemplateGallery } from "@/components/TemplateGallery";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View QR generation analytics, run bulk CSV generation, and browse branded templates.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Your QR <span className="text-gradient">command center</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Track everything you&apos;ve created, generate codes in bulk, and apply
          professional templates built for business use.
        </p>
      </header>

      <div className="space-y-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
