"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { TEMPLATES } from "@/lib/share";
import { DEFAULT_OPTIONS, toPngDataUrl } from "@/lib/qr";
import { Card } from "@/components/ui/Card";

const SAMPLE = "https://qrstudio.app";

export function TemplateGallery() {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const entries = await Promise.all(
        TEMPLATES.map(async (t) => {
          const png = await toPngDataUrl(SAMPLE, {
            ...DEFAULT_OPTIONS,
            ...t.options,
            size: 160,
          });
          return [t.id, png] as const;
        }),
      );
      if (active) setPreviews(Object.fromEntries(entries));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
          <Palette size={18} />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">
            Branded templates
          </h3>
          <p className="text-sm text-muted">
            Business-ready styles — apply them in one tap on the generator.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            href="/#generator"
            className="group rounded-3xl border border-line bg-surface-2/40 p-4 transition-all hover:-translate-y-1 hover:border-brand/50 hover:shadow-glow"
          >
            <div
              className="mb-3 grid aspect-square place-items-center rounded-2xl"
              style={{ background: t.options.bgColor }}
            >
              {previews[t.id] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previews[t.id]}
                  alt={t.name}
                  className="w-3/4 rounded-lg"
                />
              ) : (
                <div className="h-3/4 w-3/4 animate-pulse rounded-lg bg-surface/40" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted">{t.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-brand"
              />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
