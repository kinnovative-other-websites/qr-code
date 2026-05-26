import { Hero } from "@/components/Hero";
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
      <Hero />
      <QRGenerator />

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="glass rounded-4xl p-6 transition-transform hover:-translate-y-1"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Icon size={20} />
              </span>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
