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
- **Sidebar navigation** (collapsible drawer on mobile) across three pages

**URL Shortener** (`/shorten`)
- Long-URL input with validation, **custom alias** and **expiry date** options
- Unique short codes via **NanoID**, copy + open/test buttons
- Instant QR code for every short link
- Per-link analytics: **click count, created date, last accessed date**
- **Search + filter** (all / active / expired) over full history
- Persisted in `localStorage` via a **Context store**; live cross-tab updates

**Dashboard** (`/dashboard`)
- QR generation analytics (7-day activity + top-domains)
- Short-link performance: totals, recent links, and **most-used** ranking
- **Recently generated QR codes** with thumbnails
- **Bulk generation** from a CSV upload → ZIP of codes (with entity frames)
- Six **branded templates** with live previews
- **Export history to CSV** (links and QR history)

**Quality**
- Modular component structure, fully typed
- Responsive across mobile / tablet / desktop
- SEO: metadata, Open Graph, Twitter cards, JSON-LD, `sitemap.xml`, `robots.txt`
- Accessible controls, reduced-motion support
- Code-split heavy libs (jsPDF imported on demand)

---

## 🏷️ Entity Frames (PGOS / DPS)

Each QR can be wrapped in a branded **letterhead card** chosen from the customization panel (**None / PGOS / DPS**). The card shows the school header (crest + wordmark) on top, a brand-colored divider, the QR below, and a brand border. Frames are drawn into the rendered canvas and SVG — not as CSS overlays — so they're baked into every **PNG, SVG, and PDF** export.

- **PGOS — Pallavi Group of Schools** — green border with bottom corner accents (default `#058041`).
- **DPS — Delhi Public School** — green border with a double rule (default `#006f45`).

Each frame's accent color is overridable in the UI. The header artwork is stored, base64-encoded, in `src/lib/headerAssets.ts`, and each entity's metadata (name, accent, border style, header, aspect ratio) lives in `FRAMES` in `src/lib/frames.ts`.

**To swap a school logo:** replace the corresponding `HEADER_*` data URL in `src/lib/headerAssets.ts` with your own (a wide header banner works best — trim whitespace, key out the background if it isn't white, and keep the green linework on transparent), and update the matching `headerAspect` (= image width ÷ height). Reference copies of the processed headers are in `public/headers/`.

**To add another entity:** extend `EntityId` in `src/types/index.ts`, add a config to `FRAMES` (`style: "brackets" | "double"`), and add its header to `headerAssets.ts`. All frame geometry is fractional, so it scales at any resolution.

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
| Short links    | NanoID (unique codes) |
| State          | React Context (links) + hooks (QR) |
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

### Environment variables

The **core app needs none** — QR codes and short links work fully client-side. For the optional backend (cross-device short links, dynamic QR, real scan tracking), copy `.env.example` to `.env.local` and fill in your datastore credentials. See the URL Shortener and Dynamic QR sections below.

```bash
cp .env.example .env.local
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, SEO metadata, providers, AppShell
│   ├── page.tsx            # Hero + QR generator + features
│   ├── shorten/page.tsx    # URL shortener page
│   ├── s/[code]/page.tsx   # Short-link redirect + click tracking
│   ├── dashboard/page.tsx  # QR + link analytics, recent items, bulk, templates
│   ├── api/r/[id]/route.ts # Dynamic-QR redirect scaffold (optional backend)
│   └── globals.css · icon.svg · sitemap.ts · robots.ts
├── components/
│   ├── providers/{Providers,LinksProvider}.tsx   # theme/toasts + Context store
│   ├── ui/{Card,ThemeToggle}.tsx
│   ├── AppShell.tsx · Sidebar.tsx · Hero.tsx · Footer.tsx
│   ├── QRGenerator · QRPreview · CustomizationPanel · EntityFramePicker
│   ├── ResultActions · HistoryPanel
│   ├── Shortener.tsx                              # shortener form + history
│   ├── BulkGenerator · AnalyticsDashboard · TemplateGallery
│   └── dashboard/{LinksPanel,RecentQRCodes}.tsx
├── hooks/useQRStudio.ts
├── lib/
│   ├── qr.ts · frames.ts · headerAssets.ts        # QR + entity frames
│   ├── links.ts                                   # short-link store + analytics
│   ├── csv.ts                                     # CSV export (links + QR)
│   ├── validation.ts · download.ts · storage.ts · share.ts · utils.ts
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

## 🔗 URL Shortener & Click Tracking

The `/shorten` page creates short links (`/s/<code>`) with optional custom aliases and expiry dates. Codes are generated with **NanoID** and stored, with their analytics, in a **React Context store** backed by `localStorage` (`src/components/providers/LinksProvider.tsx`).

Visiting a short link hits `src/app/s/[code]/page.tsx`, which looks the code up, **records the click** (count + last-accessed), checks expiry, and redirects. Because storage is local, links resolve in the browser where they were created, and click counts update live across open tabs via the `storage` event.

**For cross-device short links + real analytics**, add a tiny backend. Example with Supabase:

```ts
// resolve + count in an API route or src/app/s/[code]
const { data } = await supabase.from("links").select("url").eq("code", code).single();
await supabase.rpc("increment_click", { link_code: code });
return Response.redirect(data.url, 302);
```

Wire the same store into `src/app/api/r/[id]/route.ts` for dynamic QR redirects, then surface server counts on the dashboard. See `.env.example` for the variables.

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
