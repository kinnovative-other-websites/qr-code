import QRCode from "qrcode";
import type { QROptions, QRErrorLevel } from "@/types";
import { drawFrame, wrapSvgWithFrame } from "./frames";

export const DEFAULT_OPTIONS: QROptions = {
  size: 320,
  margin: 2,
  fgColor: "#0f172a",
  bgColor: "#ffffff",
  errorLevel: "M",
  logo: null,
  logoScale: 0.22,
  cornerRadius: 24,
  entity: "none",
  frameColor: null,
  frameLabel: null,
};

/** When a logo covers the center we need maximum error correction. */
function effectiveLevel(opts: QROptions): QRErrorLevel {
  if (opts.logo && (opts.errorLevel === "L" || opts.errorLevel === "M")) {
    return "H";
  }
  return opts.errorLevel;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the logo image."));
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Render a QR code to a canvas with optional rounded background and center logo.
 * Uses a 2x scale factor for crisp exports on high-density displays.
 */
export async function renderToCanvas(
  text: string,
  options: QROptions,
): Promise<HTMLCanvasElement> {
  const scale = 2;
  const size = options.size * scale;

  // Base QR drawn on its own canvas.
  const base = document.createElement("canvas");
  await QRCode.toCanvas(base, text, {
    width: size,
    margin: options.margin,
    errorCorrectionLevel: effectiveLevel(options),
    color: { dark: options.fgColor, light: options.bgColor },
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  // Rounded background.
  if (options.cornerRadius > 0) {
    roundedRectPath(ctx, 0, 0, size, size, options.cornerRadius * scale);
    ctx.fillStyle = options.bgColor;
    ctx.fill();
    ctx.save();
    roundedRectPath(ctx, 0, 0, size, size, options.cornerRadius * scale);
    ctx.clip();
  } else {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.drawImage(base, 0, 0, size, size);
  if (options.cornerRadius > 0) ctx.restore();

  // Center logo with a padded plate so it stays scannable.
  if (options.logo) {
    const img = await loadImage(options.logo);
    const logoSize = size * options.logoScale;
    const pad = logoSize * 0.16;
    const plate = logoSize + pad * 2;
    const x = (size - plate) / 2;
    const y = (size - plate) / 2;

    roundedRectPath(ctx, x, y, plate, plate, plate * 0.22);
    ctx.fillStyle = options.bgColor;
    ctx.fill();

    ctx.save();
    roundedRectPath(
      ctx,
      x + pad,
      y + pad,
      logoSize,
      logoSize,
      logoSize * 0.18,
    );
    ctx.clip();
    ctx.drawImage(img, x + pad, y + pad, logoSize, logoSize);
    ctx.restore();
  }

  // Wrap in the selected entity frame (no-op when entity is "none").
  return await drawFrame(canvas, options);
}

export async function toPngDataUrl(
  text: string,
  options: QROptions,
): Promise<string> {
  const canvas = await renderToCanvas(text, options);
  return canvas.toDataURL("image/png");
}

/**
 * Produce an SVG string. The qrcode library renders vector modules; if a logo
 * is present we inject a plate + embedded image at the center of the viewBox.
 */
export async function toSvgString(
  text: string,
  options: QROptions,
): Promise<string> {
  let svg = await QRCode.toString(text, {
    type: "svg",
    margin: options.margin,
    width: options.size,
    errorCorrectionLevel: effectiveLevel(options),
    color: { dark: options.fgColor, light: options.bgColor },
  });

  if (options.logo) {
    const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const vb = match ? parseFloat(match[1]) : options.size;
    const logoSize = vb * options.logoScale;
    const pad = logoSize * 0.16;
    const plate = logoSize + pad * 2;
    const x = (vb - plate) / 2;
    const y = (vb - plate) / 2;
    const lx = x + pad;
    const ly = y + pad;

    const overlay =
      `<rect x="${x}" y="${y}" width="${plate}" height="${plate}" rx="${plate * 0.22}" fill="${options.bgColor}"/>` +
      `<image x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" ` +
      `href="${options.logo}" preserveAspectRatio="xMidYMid slice"/>`;

    svg = svg.replace("</svg>", `${overlay}</svg>`);
  }

  // Wrap in the selected entity frame (no-op when entity is "none").
  return wrapSvgWithFrame(svg, options.size, options);
}
