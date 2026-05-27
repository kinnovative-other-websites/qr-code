import type { Metadata } from "next";
import { Shortener } from "@/components/Shortener";

export const metadata: Metadata = {
  title: "URL Shortener",
  description:
    "Create short links with custom aliases, expiry dates, click analytics, and instant QR codes.",
  alternates: { canonical: "/shorten" },
};

export default function ShortenPage() {
  return <Shortener />;
}
