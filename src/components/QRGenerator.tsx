"use client";

import { motion } from "framer-motion";
import { Link as LinkIcon, Sparkles, Loader2, SlidersHorizontal } from "lucide-react";
import { useQRStudio } from "@/hooks/useQRStudio";
import { Card } from "@/components/ui/Card";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { QRPreview } from "@/components/QRPreview";
import { ResultActions } from "@/components/ResultActions";
import { HistoryPanel } from "@/components/HistoryPanel";

export function QRGenerator() {
  const studio = useQRStudio();
  const {
    url,
    setUrl,
    options,
    patchOptions,
    result,
    loading,
    generate,
    history,
    restore,
    remove,
    clearAll,
  } = studio;

  return (
    <section id="generator" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — input + customization */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-semibold"
              >
                Enter a URL
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <LinkIcon
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="url"
                    type="text"
                    inputMode="url"
                    placeholder="example.com or https://your-link.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generate()}
                    className="field pl-11"
                  />
                </div>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="btn-primary shrink-0"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  Generate
                </button>
              </div>
            </div>

            <div className="border-t border-line pt-6">
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted">
                <SlidersHorizontal size={16} className="text-brand" />
                Customize
              </div>
              <CustomizationPanel options={options} patch={patchOptions} />
            </div>
          </Card>
        </motion.div>

        {/* RIGHT — preview + actions + history */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <Card className="space-y-5">
            <QRPreview result={result} loading={loading} />
            {result && !loading && <ResultActions result={result} />}
          </Card>

          <Card>
            <HistoryPanel
              history={history}
              onRestore={restore}
              onRemove={remove}
              onClear={clearAll}
            />
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
