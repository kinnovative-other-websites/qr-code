import type { Metadata } from "next";
import { CertificateGeneratorFrame } from "@/components/CertificateGeneratorFrame";

export const metadata: Metadata = {
  title: "Certificate Generator",
  description:
    "Design certificate templates, merge spreadsheet data, preview recipients, and export generated certificates.",
  alternates: { canonical: "/certificate-generator" },
};

export default function CertificateGeneratorPage() {
  return <CertificateGeneratorFrame />;
}
