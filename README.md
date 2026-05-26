# QR Studio

A premium, production-ready **QR Code Generator** built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Design, customize, and export branded QR codes — entirely in the browser, with no backend required.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06b6d4)

---

## ✨ Features

**Core**
- URL input with smart validation & auto `https://` normalization
- Instant generation with a polished loading state
- Live preview that re-renders as you tweak options
- Customization: size, margin, foreground/background colors, error-correction level, **rounded corners**, and a **center logo** (error correction auto-boosts to High for scannability)
- Exports: **PNG**, **SVG** (true vector), and **PDF**
- Copy URL + native/web share (WhatsApp, Email, X, LinkedIn, Facebook, Telegram)
- Recent history persisted in `localStorage`
- Light / dark mode with system detection

**Dashboard**
- Generation analytics (7-day activity area chart + top-domains pie) via Recharts
- **Bulk generation** from a CSV upload → downloads a ZIP of PNGs
- Six **branded templates** with live previews

**Quality**
- Modular component structure, fully typed
- Responsive across mobile / tablet / desktop
- SEO: metadata, Open Graph, Twitter cards, JSON-LD, `sitemap.xml`, `robots.txt`
- Accessible controls, reduced-motion support
- Code-split heavy libs (jsPDF imported on demand)

---

## 🧱 Tech Stack

| Concern        | Choice |
| -------------- | ------ |
| Framework      | Next.js 14 (App Router) |
| Language       | TypeScript |
| Styling        | Tailwind CSS + CSS variables |
| QR engine      | [`qrcode`](https://www.npmjs.com/package/qrcode) |
| Charts         | Recharts |
| Animation      | Framer Motion |
| Icons          | lucide-react |
| Notifications  | Sonner |
| Theming        | next-themes |
| Export         | jsPDF · JSZip · file-saver · PapaParse |
| Fonts          | Clash Display + Satoshi (Fontshare) |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# open http://localhost:3000

# 3. Production build
npm run build
npm run start
```

Requires **Node.js 18.17+**.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, SEO metadata, providers
│   ├── page.tsx            # Hero + generator + features
│   ├── globals.css         # Theme tokens & utility classes
│   ├── icon.svg            # Favicon
│   ├── sitemap.ts          # SEO sitemap
│   ├── robots.ts           # SEO robots
│   ├── dashboard/page.tsx  # Analytics + bulk + templates
│   └── api/r/[id]/route.ts # Dynamic-QR redirect scaffold (optional backend)
├── components/
│   ├── providers/Providers.tsx
│   ├── ui/{Card,ThemeToggle}.tsx
│   ├── Navbar · Hero · Footer
│   ├── QRGenerator · QRPreview · CustomizationPanel · ResultActions
│   ├── HistoryPanel
│   └── BulkGenerator · AnalyticsDashboard · TemplateGallery
├── hooks/useQRStudio.ts    # Central generator state
├── lib/
│   ├── qr.ts               # Canvas/PNG/SVG rendering + logo compositing
│   ├── validation.ts       # URL validation/normalization
│   ├── download.ts         # PNG/SVG/PDF/ZIP exports
│   ├── storage.ts          # localStorage history
│   ├── share.ts            # share links + templates
│   └── utils.ts
└── types/index.ts
```

---

## 📦 Bulk Generation

Upload a CSV on the **Dashboard**. Format:

```csv
url,label
https://example.com,Homepage
example.org/pricing,Pricing
```

The first column is the URL (protocol optional); the second is an optional filename label. A header row is auto-detected. Output is a ZIP of PNGs. A ready-made `public/sample-bulk.csv` is included.

---

## 🔁 Dynamic QR Codes & Live Scan Analytics (optional backend)

The client app ships with a redirect scaffold at `src/app/api/r/[id]/route.ts`.

A **dynamic** QR encodes a stable short URL (`/api/r/<id>`) whose destination and scan count live server-side — so you can change where a printed code points and count real scans.

To enable it, implement `lookup(id)` and `recordScan(id, req)` against any store. Example with Vercel KV:

```ts
import { kv } from "@vercel/kv";

async function lookup(id: string) {
  return kv.get<string>(`qr:dest:${id}`);
}
async function recordScan(id: string) {
  await kv.incr(`qr:scans:${id}`);
}
```

Then encode `https://your-domain.com/api/r/<id>` instead of the raw URL, and surface `qr:scans:*` in the analytics dashboard. Without this, the dashboard shows **generation** analytics from local data (clearly labeled).

---

## ☁️ Deployment

Zero-config on **Vercel**:

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Deploy — no environment variables needed for the core app.

Also works on Netlify, Cloudflare Pages, or any Node host (`npm run build && npm run start`). Update the `SITE_URL` constant in `layout.tsx`, `sitemap.ts`, and `robots.ts` to your domain.

---

## 🔒 Privacy

All QR generation, customization, exports, and history happen **locally in your browser**. Nothing is uploaded unless you enable the optional dynamic-QR backend.

## 📄 License

MIT — free for personal and commercial use.
