"use client";

export function CertificateGeneratorFrame() {
  return (
    <section className="h-[calc(100vh-64px)] min-h-[720px] bg-canvas p-3 sm:p-4 lg:h-screen lg:min-h-screen">
      <iframe
        title="Certificate Generator Studio"
        src="/certificate-generator.html"
        className="h-full w-full rounded-2xl border border-line bg-white shadow-glass"
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      />
    </section>
  );
}
