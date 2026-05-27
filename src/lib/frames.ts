import type { EntityId, QROptions } from "@/types";
import {
  HEADER_PGOS,
  HEADER_PGOS_ASPECT,
  HEADER_DPS,
  HEADER_DPS_ASPECT,
} from "./headerAssets";

/**
 * ENTITY FRAMES — branded "letterhead" cards
 * ------------------------------------------
 * Each entity wraps the QR in a white card with: the school header (crest +
 * wordmark) on top, a brand-colored divider, the QR below, and a brand border.
 * Frames are drawn into the canvas (PNG/PDF) AND the SVG, so they're baked into
 * every export.
 *
 * Geometry is expressed as fractions of the QR side `Q`, so it scales at any
 * resolution. To add an entity: extend `EntityId` in types, then add a config.
 */

export interface FrameConfig {
  id: Exclude<EntityId, "none">;
  name: string;
  /** full descriptive name */
  label: string;
  /** default border/divider accent (user-overridable via options.frameColor) */
  accent: string;
  /** border decoration variant */
  style: "brackets" | "double";
  /** base64 header image */
  header: string;
  /** header width / height */
  headerAspect: number;
  description: string;
}

export const FRAMES: Record<Exclude<EntityId, "none">, FrameConfig> = {
  pgos: {
    id: "pgos",
    name: "PGOS",
    label: "Pallavi Group of Schools",
    accent: "#058041",
    style: "brackets",
    header: HEADER_PGOS,
    headerAspect: HEADER_PGOS_ASPECT,
    description: "Pallavi Group of Schools header, border + corner accents.",
  },
  dps: {
    id: "dps",
    name: "DPS",
    label: "Delhi Public School",
    accent: "#006f45",
    style: "double",
    header: HEADER_DPS,
    headerAspect: HEADER_DPS_ASPECT,
    description: "Delhi Public School header, border + double rule.",
  },
};

export const ENTITY_OPTIONS: { id: EntityId; name: string }[] = [
  { id: "none", name: "None" },
  { id: "pgos", name: "PGOS" },
  { id: "dps", name: "DPS" },
];

export function getFrame(opts: QROptions): FrameConfig | null {
  if (!opts.entity || opts.entity === "none") return null;
  return FRAMES[opts.entity];
}

export function frameAccent(opts: QROptions): string {
  const cfg = getFrame(opts);
  return opts.frameColor || cfg?.accent || FRAMES.pgos.accent;
}

interface Geometry {
  M: number;
  t: number;
  R: number;
  W: number;
  H: number;
  headerY: number;
  headerW: number;
  headerH: number;
  dividerY: number;
  qrY: number;
  qp: number;
}

/** Shared layout math for canvas + SVG, given QR side length Q. */
function layout(Q: number, cfg: FrameConfig): Geometry {
  const M = 0.09 * Q;
  const topPad = 0.07 * Q;
  const gapHd = 0.05 * Q;
  const gapDq = 0.06 * Q;
  const bottomPad = M;
  const t = 0.022 * Q;
  const R = 0.08 * Q;
  const headerW = Q;
  const headerH = headerW / cfg.headerAspect;
  const headerY = topPad;
  const dividerY = headerY + headerH + gapHd;
  const qrY = dividerY + gapDq;
  const W = Q + 2 * M;
  const H = qrY + Q + bottomPad;
  return { M, t, R, W, H, headerY, headerW, headerH, dividerY, qrY, qp: 0.02 * Q };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load header image."));
    img.src = src;
  });
}

/** Wrap a rendered QR canvas in the entity letterhead. No-op when entity none. */
export async function drawFrame(
  qr: HTMLCanvasElement,
  opts: QROptions,
): Promise<HTMLCanvasElement> {
  const cfg = getFrame(opts);
  if (!cfg) return qr;

  const Q = qr.width;
  const g = layout(Q, cfg);
  const accent = opts.frameColor || cfg.accent;

  const cv = document.createElement("canvas");
  cv.width = g.W;
  cv.height = g.H;
  const ctx = cv.getContext("2d");
  if (!ctx) return qr;

  // White card
  roundRect(ctx, 0, 0, g.W, g.H, g.R);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Header
  try {
    const hi = await loadImage(cfg.header);
    ctx.drawImage(hi, g.M, g.headerY, g.headerW, g.headerH);
  } catch {
    /* header failed to load — keep the rest of the card */
  }

  // Divider
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1.5, 0.006 * Q);
  ctx.beginPath();
  ctx.moveTo(g.M, g.dividerY);
  ctx.lineTo(g.W - g.M, g.dividerY);
  ctx.stroke();

  // Subtle QR outline
  roundRect(ctx, g.M - g.qp, g.qrY - g.qp, Q + 2 * g.qp, Q + 2 * g.qp, 0.04 * Q);
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = Math.max(1, 0.004 * Q);
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // QR
  ctx.drawImage(qr, g.M, g.qrY, Q, Q);

  // Border
  roundRect(ctx, g.t / 2, g.t / 2, g.W - g.t, g.H - g.t, g.R - g.t / 2);
  ctx.lineWidth = g.t;
  ctx.strokeStyle = accent;
  ctx.stroke();

  if (cfg.style === "brackets") {
    const mb = 0.05 * Q;
    const arm = 0.08 * Q;
    const cy = g.H - mb;
    const vy = g.H - 0.12 * Q;
    ctx.lineWidth = g.t;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(mb, vy);
    ctx.lineTo(mb, cy);
    ctx.lineTo(mb + arm, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(g.W - mb, vy);
    ctx.lineTo(g.W - mb, cy);
    ctx.lineTo(g.W - mb - arm, cy);
    ctx.stroke();
    ctx.lineCap = "butt";
  } else {
    ctx.lineWidth = Math.max(1, 0.006 * Q);
    ctx.strokeStyle = accent;
    roundRect(ctx, 0.045 * Q, 0.045 * Q, g.W - 0.09 * Q, g.H - 0.09 * Q, g.R * 0.8);
    ctx.stroke();
  }

  return cv;
}

/** Wrap a QR SVG in the entity letterhead (vector). No-op when entity none. */
export function wrapSvgWithFrame(
  innerSvg: string,
  Q: number,
  opts: QROptions,
): string {
  const cfg = getFrame(opts);
  if (!cfg) return innerSvg;

  const g = layout(Q, cfg);
  const accent = opts.frameColor || cfg.accent;
  const dw = Math.max(1.5, 0.006 * Q);

  const inner = innerSvg
    .replace("<svg ", `<svg x="${g.M}" y="${g.qrY}" `)
    .replace(/width="[^"]+"/, `width="${Q}"`)
    .replace(/height="[^"]+"/, `height="${Q}"`);

  let extras = "";
  if (cfg.style === "brackets") {
    const mb = 0.05 * Q;
    const arm = 0.08 * Q;
    const cy = g.H - mb;
    const vy = g.H - 0.12 * Q;
    extras =
      `<path d="M${mb} ${vy} L${mb} ${cy} L${mb + arm} ${cy}" fill="none" stroke="${accent}" stroke-width="${g.t}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M${g.W - mb} ${vy} L${g.W - mb} ${cy} L${g.W - mb - arm} ${cy}" fill="none" stroke="${accent}" stroke-width="${g.t}" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    extras = `<rect x="${0.045 * Q}" y="${0.045 * Q}" width="${g.W - 0.09 * Q}" height="${g.H - 0.09 * Q}" rx="${g.R * 0.8}" fill="none" stroke="${accent}" stroke-width="${Math.max(1, 0.006 * Q)}"/>`;
  }

  const out =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${g.W}" height="${g.H}" viewBox="0 0 ${g.W} ${g.H}">` +
    `<rect x="0" y="0" width="${g.W}" height="${g.H}" rx="${g.R}" fill="#ffffff"/>` +
    `<image x="${g.M}" y="${g.headerY}" width="${g.headerW}" height="${g.headerH}" href="${cfg.header}" preserveAspectRatio="xMidYMid meet"/>` +
    `<line x1="${g.M}" y1="${g.dividerY}" x2="${g.W - g.M}" y2="${g.dividerY}" stroke="${accent}" stroke-width="${dw}"/>` +
    `<rect x="${g.M - g.qp}" y="${g.qrY - g.qp}" width="${Q + 2 * g.qp}" height="${Q + 2 * g.qp}" rx="${0.04 * Q}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="${Math.max(1, 0.004 * Q)}"/>` +
    inner +
    `<rect x="${g.t / 2}" y="${g.t / 2}" width="${g.W - g.t}" height="${g.H - g.t}" rx="${g.R - g.t / 2}" fill="none" stroke="${accent}" stroke-width="${g.t}"/>` +
    extras +
    `</svg>`;

  return out.replace(/\d+\.\d{3,}/g, (m) =>
    String(Math.round(parseFloat(m) * 100) / 100),
  );
}
