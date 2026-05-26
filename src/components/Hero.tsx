"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, Palette } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  { icon: Zap, label: "Instant render" },
  { icon: Palette, label: "Full customization" },
  { icon: ShieldCheck, label: "Validated URLs" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-70" />
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-sm text-muted backdrop-blur"
        >
          <Sparkles size={14} className="text-brand" />
          Premium QR generation, free & private
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Turn any link into a
          <span className="text-gradient"> beautiful QR code</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted"
        >
          Customize colors, drop in your logo, and export pixel-perfect PNG, SVG,
          or PDF in seconds. Everything runs in your browser — your data never
          leaves your device.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {features.map(({ icon: Icon, label }) => (
            <span key={label} className="chip">
              <Icon size={14} className="text-brand" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
