"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, QrCode, Unlink, AlertTriangle } from "lucide-react";
import { findByCode, isExpired, recordClick } from "@/lib/links";

type State = "resolving" | "redirecting" | "expired" | "notfound";

export default function RedirectPage() {
  const params = useParams<{ code: string }>();
  const code = params?.code;
  const [state, setState] = useState<State>("resolving");
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    if (!code) return;
    const link = findByCode(code);
    if (!link) {
      setState("notfound");
      return;
    }
    if (isExpired(link)) {
      setState("expired");
      return;
    }
    recordClick(code);
    setTarget(link.url);
    setState("redirecting");
    const t = setTimeout(() => window.location.replace(link.url), 600);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="glass w-full max-w-md rounded-4xl p-8 text-center">
        {state === "resolving" || state === "redirecting" ? (
          <>
            <Loader2 size={36} className="mx-auto animate-spin text-brand" />
            <h1 className="mt-4 font-display text-2xl font-semibold">
              {state === "redirecting" ? "Redirecting…" : "Resolving link…"}
            </h1>
            {target && (
              <p className="mt-2 break-all text-sm text-muted">{target}</p>
            )}
            {state === "redirecting" && (
              <a href={target} className="btn-ghost mt-5 inline-flex">
                Continue manually
              </a>
            )}
          </>
        ) : state === "expired" ? (
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
              This short link doesn&apos;t exist on this device. Links are stored
              locally — open it in the browser where it was created, or connect a
              backend (see README).
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
