import { NextResponse } from "next/server";

/**
 * DYNAMIC QR REDIRECT + SCAN TRACKING (scaffold)
 * ----------------------------------------------
 * A "dynamic" QR code encodes a short, stable URL like:
 *
 *     https://your-domain.com/api/r/<id>
 *
 * The QR image therefore NEVER changes, but the destination it points to
 * (and the scan count) live server-side, so you can:
 *   - edit the destination after printing the code
 *   - count every scan for the analytics dashboard
 *
 * This file is intentionally backend-agnostic. Wire `lookup()` and
 * `recordScan()` to your store of choice (Vercel KV, Upstash Redis,
 * Postgres/Prisma, Supabase, etc). Until then it returns 501.
 *
 * Example with Vercel KV:
 *   import { kv } from "@vercel/kv";
 *   const dest = await kv.get<string>(`qr:dest:${id}`);
 *   await kv.incr(`qr:scans:${id}`);
 */

async function lookup(_id: string): Promise<string | null> {
  // TODO: replace with a real datastore lookup.
  return null;
}

async function recordScan(_id: string, _req: Request): Promise<void> {
  // TODO: increment a counter + optionally log user-agent / referrer / timestamp.
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const destination = await lookup(id);

  if (!destination) {
    return NextResponse.json(
      {
        error: "Dynamic QR backend not configured.",
        hint: "Implement lookup()/recordScan() in src/app/api/r/[id]/route.ts. See README.",
      },
      { status: 501 },
    );
  }

  await recordScan(id, req);
  return NextResponse.redirect(destination, 302);
}
