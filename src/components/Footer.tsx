import { QrCode, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <QrCode size={16} className="text-brand" />
          <span>
            QR<span className="font-semibold text-ink">Studio</span> — built with
            Next.js & Tailwind
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="hover:text-ink">
            Generator
          </Link>
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-ink"
          >
            <Github size={15} /> Source
          </a>
        </div>
      </div>
    </footer>
  );
}
