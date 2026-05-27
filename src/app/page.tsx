import { BulkGenerator } from "@/components/BulkGenerator";
import { TemplateGallery } from "@/components/TemplateGallery";
import { QRGenerator } from "@/components/QRGenerator";
import { Zap, Lock, Layers, Sparkles } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Logo & color branding",
    body: "Drop in your logo and match your brand palette with live preview.",
  },
  {
    icon: Layers,
    title: "PNG · SVG · PDF",
    body: "Export crisp raster and vector files ready for print or web.",
  },
  {
    icon: Zap,
    title: "Bulk from CSV",
    body: "Generate hundreds of codes at once and download them as a ZIP.",
  },
  {
    icon: Lock,
    title: "100% private",
    body: "Everything runs locally — no uploads, no tracking, no account.",
  },
];

export default function HomePage() {
  return (
    <>
      <QRGenerator />

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Tools
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Bulk & templates
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BulkGenerator />
          <TemplateGallery />
        </div>
      </section>

    </>
  );
}
