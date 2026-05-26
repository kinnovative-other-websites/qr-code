"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Copy,
  Check,
  Share2,
  FileImage,
  FileCode2,
  FileText,
  Mail,
  MessageCircle,
  Linkedin,
  Twitter,
  Facebook,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { GeneratedResult } from "@/hooks/useQRStudio";
import { downloadPdf, downloadPng, downloadSvg } from "@/lib/download";
import { shareLinks } from "@/lib/share";

export function ResultActions({ result }: { result: GeneratedResult }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy URL");
    }
  }

  async function run(kind: "png" | "svg" | "pdf") {
    setBusy(kind);
    try {
      if (kind === "png") await downloadPng(result.url, result.options);
      if (kind === "svg") await downloadSvg(result.url, result.options);
      if (kind === "pdf") await downloadPdf(result.url, result.options);
      toast.success(`${kind.toUpperCase()} downloaded`);
    } catch {
      toast.error(`Failed to export ${kind.toUpperCase()}`);
    } finally {
      setBusy(null);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "QR Code", url: result.url });
        return;
      } catch {
        /* user dismissed — fall through to menu */
      }
    }
    setShareOpen((o) => !o);
  }

  const links = shareLinks(result.url, "Scan this QR code");
  const socials = [
    { href: links.whatsapp, label: "WhatsApp", icon: MessageCircle },
    { href: links.email, label: "Email", icon: Mail },
    { href: links.x, label: "X / Twitter", icon: Twitter },
    { href: links.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: links.facebook, label: "Facebook", icon: Facebook },
    { href: links.telegram, label: "Telegram", icon: Send },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <ExportBtn
          label="PNG"
          icon={FileImage}
          loading={busy === "png"}
          onClick={() => run("png")}
        />
        <ExportBtn
          label="SVG"
          icon={FileCode2}
          loading={busy === "svg"}
          onClick={() => run("svg")}
        />
        <ExportBtn
          label="PDF"
          icon={FileText}
          loading={busy === "pdf"}
          onClick={() => run("pdf")}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={copyUrl} className="btn-ghost flex-1">
          {copied ? (
            <Check size={16} className="text-brand" />
          ) : (
            <Copy size={16} />
          )}
          {copied ? "Copied" : "Copy URL"}
        </button>

        <div className="relative flex-1">
          <button onClick={nativeShare} className="btn-ghost w-full">
            <Share2 size={16} /> Share
          </button>
          <AnimatePresence>
            {shareOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="glass-strong absolute bottom-full left-0 z-30 mb-2 grid w-56 grid-cols-3 gap-1 rounded-2xl p-2"
              >
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <Icon size={18} />
                    {label.split(" ")[0]}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ExportBtn({
  label,
  icon: Icon,
  loading,
  onClick,
}: {
  label: string;
  icon: typeof Download;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface-2/50 py-3 transition-all hover:-translate-y-0.5 hover:border-brand/50 disabled:opacity-60"
    >
      {loading ? (
        <Download size={18} className="animate-bounce text-brand" />
      ) : (
        <Icon
          size={18}
          className="text-muted transition-colors group-hover:text-brand"
        />
      )}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
