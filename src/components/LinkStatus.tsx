import Link from "next/link";
import { Unlink, AlertTriangle, QrCode } from "lucide-react";

export function LinkStatus({ status }: { status: "expired" | "notfound" }) {
  const expired = status === "expired";
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="glass w-full max-w-md rounded-4xl p-8 text-center">
        {expired ? (
          <>
            <AlertTriangle size={36} className="mx-auto text-amber-500" />
            <h1 className="mt-4 font-display text-2xl font-semibold">
              This link has expired
            </h1>
            <p className="mt-2 text-sm text-muted">
              The owner set an expiry date that has now passed.
            </p>
            <Link href="/shorten" className="btn-primary mt-5 inline-flex">
              Create a new link
            </Link>
          </>
        ) : (
          <>
            <Unlink size={36} className="mx-auto text-muted" />
            <h1 className="mt-4 font-display text-2xl font-semibold">
              Link not found
            </h1>
            <p className="mt-2 text-sm text-muted">
              This short link doesn&apos;t exist or may have been deleted.
            </p>
            <Link href="/shorten" className="btn-ghost mt-5 inline-flex gap-2">
              <QrCode size={16} /> Go to Short Links
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
