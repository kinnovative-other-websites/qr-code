import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { AppShell } from "@/components/AppShell";

const SITE_URL = "https://qrstudio.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "QR Studio — Free Custom QR Code Generator",
    template: "%s · QR Studio",
  },
  description:
    "Generate beautiful, customizable QR codes for any URL. Add your logo, pick colors, and export PNG, SVG, or PDF — all in your browser, free and private.",
  keywords: [
    "QR code generator",
    "custom QR code",
    "QR code with logo",
    "free QR generator",
    "QR code SVG PNG PDF",
    "bulk QR codes",
  ],
  authors: [{ name: "QR Studio" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "QR Studio — Free Custom QR Code Generator",
    description:
      "Design and export branded QR codes with logos, colors, and instant PNG/SVG/PDF downloads.",
    siteName: "QR Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Studio — Free Custom QR Code Generator",
    description:
      "Design and export branded QR codes with logos, colors, and instant downloads.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "QR Studio",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Free, private, browser-based QR code generator with logo support and PNG/SVG/PDF export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
