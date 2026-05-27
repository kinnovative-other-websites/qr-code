"use client";

import { AnimatePresence, motion } from "framer-motion";
import { QrCode, Loader2 } from "lucide-react";
import type { GeneratedResult } from "@/hooks/useQRStudio";

interface Props {
  result: GeneratedResult | null;
  loading: boolean;
}

export function QRPreview({ result, loading }: Props) {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-4xl border border-line bg-surface-2/40 p-6">
      {/* Decorative corner ticks */}
      <Corner className="left-4 top-4 border-l-2 border-t-2" />
      <Corner className="right-4 top-4 border-r-2 border-t-2" />
      <Corner className="bottom-4 left-4 border-b-2 border-l-2" />
      <Corner className="bottom-4 right-4 border-b-2 border-r-2" />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4 text-muted"
          >
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-20 blur-xl" />
              <Loader2 size={64} className="animate-spin-slow text-brand" />
            </div>
            <p className="text-sm font-medium">Generating…</p>
          </motion.div>
        ) : result ? (
          <motion.div
            key={result.png}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-full bg-brand/15 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.png}
              alt={`QR code for ${result.url}`}
              className="max-h-full max-w-full w-auto rounded-2xl shadow-soft"
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-center text-muted"
          >
            <span className="grid h-20 w-20 place-items-center rounded-3xl border border-dashed border-line bg-surface/40">
              <QrCode size={34} className="opacity-50" />
            </span>
            <p className="max-w-[220px] text-sm">
              Your QR code preview will appear here once you generate it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute h-6 w-6 rounded-[6px] border-brand/40 ${className}`}
    />
  );
}
