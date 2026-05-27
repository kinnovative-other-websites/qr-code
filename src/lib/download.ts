import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { QROptions } from "@/types";
import { renderToCanvas, toPngDataUrl, toSvgString } from "./qr";

function safeName(input: string): string {
  return (
    input
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "qr-code"
  );
}

export async function downloadPng(text: string, options: QROptions) {
  const dataUrl = await toPngDataUrl(text, options);
  const blob = await (await fetch(dataUrl)).blob();
  saveAs(blob, `${safeName(text)}.png`);
}

export async function downloadSvg(text: string, options: QROptions) {
  const svg = await toSvgString(text, options);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  saveAs(blob, `${safeName(text)}.svg`);
}

export async function downloadPdf(text: string, options: QROptions) {
  // jsPDF is heavy; import it only when a PDF is actually requested.
  const { jsPDF } = await import("jspdf");
  const canvas = await renderToCanvas(text, options);
  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.height / canvas.width;
  const imgW = 280;
  const imgH = imgW * ratio;
  const x = (pageW - imgW) / 2;
  const y = 150;

  pdf.setFillColor(15, 23, 42);
  pdf.setFontSize(22);
  pdf.text("QR Code", pageW / 2, 90, { align: "center" });

  pdf.setFontSize(11);
  pdf.setTextColor(120, 120, 130);
  pdf.text(text, pageW / 2, 116, { align: "center", maxWidth: pageW - 100 });

  pdf.addImage(img, "PNG", x, y, imgW, imgH);

  pdf.setFontSize(9);
  pdf.setTextColor(160, 160, 170);
  pdf.text("Generated with QR Studio", pageW / 2, pageH - 50, {
    align: "center",
  });

  pdf.save(`${safeName(text)}.pdf`);
}

/** Build a ZIP of PNGs for a batch of URLs (bulk generation). */
export async function downloadBatchZip(
  rows: { url: string; label: string }[],
  options: QROptions,
  onProgress?: (done: number, total: number) => void,
) {
  const zip = new JSZip();
  let done = 0;

  for (const row of rows) {
    const dataUrl = await toPngDataUrl(row.url, options);
    const base64 = dataUrl.split(",")[1];
    const name = `${safeName(row.label || row.url)}.png`;
    zip.file(name, base64, { base64: true });
    done += 1;
    onProgress?.(done, rows.length);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `qr-batch-${Date.now()}.zip`);
}
