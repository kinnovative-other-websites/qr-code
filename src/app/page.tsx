import { BulkGenerator } from "@/components/BulkGenerator";
import { QRGenerator } from "@/components/QRGenerator";
import { TemplateGallery } from "@/components/TemplateGallery";

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
    <section className="mx-auto max-w-6xl space-y-4 px-4 pb-12 sm:px-6">
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

export default function HomePage() {
  return (
    <>
      <QRGenerator />
      <Section eyebrow="Tools" title="Bulk & templates">
        <div className="grid gap-6 lg:grid-cols-2">
          <BulkGenerator />
          <TemplateGallery />
        </div>
      </Section>
    </>
  );
}
