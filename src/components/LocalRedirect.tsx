"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { findByCode, isExpired, recordClick } from "@/lib/links";
import { LinkStatus } from "@/components/LinkStatus";

type State = "resolving" | "redirecting" | "expired" | "notfound";

export function LocalRedirect({ code }: { code: string }) {
  const [state, setState] = useState<State>("resolving");
  const [target, setTarget] = useState("");

  useEffect(() => {
    const link = findByCode(code);
    if (!link) return setState("notfound");
    if (isExpired(link)) return setState("expired");
    recordClick(code);
    setTarget(link.url);
    setState("redirecting");
    const t = setTimeout(() => window.location.replace(link.url), 600);
    return () => clearTimeout(t);
  }, [code]);

  if (state === "expired" || state === "notfound") {
    return <LinkStatus status={state} />;
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="glass w-full max-w-md rounded-4xl p-8 text-center">
        <Loader2 size={36} className="mx-auto animate-spin text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {state === "redirecting" ? "Redirecting…" : "Resolving link…"}
        </h1>
        {target && <p className="mt-2 break-all text-sm text-muted">{target}</p>}
        {state === "redirecting" && (
          <a href={target} className="btn-ghost mt-5 inline-flex">
            Continue manually
          </a>
        )}
      </div>
    </div>
  );
}
