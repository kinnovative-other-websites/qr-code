/**
 * URL validation utilities.
 *
 * We are permissive about the scheme on input (users rarely type "https://"),
 * but we always normalize to a fully-qualified URL before encoding.
 */

export interface ValidationResult {
  valid: boolean;
  normalized: string;
  message?: string;
}

const DOMAIN_RE =
  /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i;

/** Add a protocol if the user omitted one. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed; // already has scheme
  if (/^(mailto:|tel:|sms:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateUrl(raw: string): ValidationResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, normalized: "", message: "Please enter a URL." };
  }

  // Allow other useful schemes commonly encoded as QR.
  if (/^(mailto:|tel:|sms:|wifi:)/i.test(trimmed)) {
    return { valid: true, normalized: trimmed };
  }

  const normalized = normalizeUrl(trimmed);

  // Structural check with the URL constructor.
  try {
    const u = new URL(normalized);
    if (!u.hostname.includes(".")) {
      return {
        valid: false,
        normalized,
        message: "That doesn't look like a valid domain.",
      };
    }
  } catch {
    return {
      valid: false,
      normalized,
      message: "Please enter a valid URL (e.g. example.com).",
    };
  }

  if (!DOMAIN_RE.test(trimmed) && !DOMAIN_RE.test(normalized)) {
    return {
      valid: false,
      normalized,
      message: "Please enter a valid URL.",
    };
  }

  return { valid: true, normalized };
}
