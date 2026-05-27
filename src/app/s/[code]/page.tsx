import { redirect } from "next/navigation";
import { supabaseEnabled } from "@/lib/supabase/client";
import { remoteResolve } from "@/lib/supabase/links";
import { LinkStatus } from "@/components/LinkStatus";
import { LocalRedirect } from "@/components/LocalRedirect";

// Always resolve fresh so click counts are accurate and links work anywhere.
export const dynamic = "force-dynamic";

export default async function RedirectPage({
  params,
}: {
  params: { code: string };
}) {
  // No backend configured → resolve from this browser's local store.
  if (!supabaseEnabled) {
    return <LocalRedirect code={params.code} />;
  }

  // Global resolution: look up in Supabase, count the click, redirect.
  const res = await remoteResolve(params.code);
  if (res.status === "ok") {
    redirect(res.url);
  }
  return <LinkStatus status={res.status} />;
}
