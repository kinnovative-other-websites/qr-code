export type QRErrorLevel = "L" | "M" | "Q" | "H";

/** All options that define how a QR code looks. */
export interface QROptions {
  size: number;
  margin: number;
  fgColor: string;
  bgColor: string;
  errorLevel: QRErrorLevel;
  /** base64 data URL of an optional center logo */
  logo?: string | null;
  /** logo size as a fraction of the QR width (0.1 - 0.3) */
  logoScale: number;
  /** rounded corner radius (px) applied to PNG/preview background */
  cornerRadius: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  label?: string;
  createdAt: number;
  options: QROptions;
  /** number of times the user has interacted/scanned in this demo */
  scans: number;
  /** marks a dynamic (editable destination) code */
  dynamic: boolean;
}

export interface BulkRow {
  url: string;
  label: string;
  status: "pending" | "done" | "error";
  error?: string;
}

export interface BrandTemplate {
  id: string;
  name: string;
  description: string;
  options: Partial<QROptions>;
}
