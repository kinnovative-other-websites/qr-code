import type { BrandTemplate } from "@/types";

/** Build share-intent URLs for common platforms. */
export function shareLinks(url: string, title = "Check this out") {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    email: `mailto:?subject=${t}&body=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };
}

/** Prebuilt, business-ready color/style templates. */
export const TEMPLATES: BrandTemplate[] = [
  {
    id: "midnight",
    name: "Midnight",
    description: "High-contrast dark — perfect for premium packaging.",
    options: { fgColor: "#0f172a", bgColor: "#ffffff", cornerRadius: 28 },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Teal brand mark on a soft canvas.",
    options: { fgColor: "#0d9488", bgColor: "#f0fdfa", cornerRadius: 28 },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm coral for hospitality & retail.",
    options: { fgColor: "#be123c", bgColor: "#fff1f2", cornerRadius: 28 },
  },
  {
    id: "ink",
    name: "Mono Ink",
    description: "Classic black on white, sharp corners.",
    options: { fgColor: "#000000", bgColor: "#ffffff", cornerRadius: 0 },
  },
  {
    id: "violet",
    name: "Violet Pop",
    description: "Bold violet for events and launches.",
    options: { fgColor: "#6d28d9", bgColor: "#f5f3ff", cornerRadius: 28 },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy green for eco & wellness brands.",
    options: { fgColor: "#166534", bgColor: "#f0fdf4", cornerRadius: 28 },
  },
];
