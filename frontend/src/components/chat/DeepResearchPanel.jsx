import { useState } from "react";
import { Telescope, Search, BookOpen, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Images, AlertCircle } from "lucide-react";

const GridLoader = ({ color = "currentColor", size = 13 }) => (
  <span className="ma-grid-loader shrink-0" aria-hidden="true" style={{ width: size, height: size, color }}>
    {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
  </span>
);

export const DeepResearchPanel = ({ steps = [], sources = [], sourcesFound = [], images = [], phase = "running", query = "", elapsed = "" }) => {
  const [expanded, setExpanded] = useState(true);
  const [failedImgs, setFailedImgs] = useState(new Set());
  const isDone = phase === "done";
  const isError = phase === "error";

  // Filter out broken images
  const validImages = images.filter((img) => img.url && !failedImgs.has(img.url));

  const markFailed = (url) => setFailedImgs((prev) => new Set([...prev, url]));

  return (
    <div className="ma-pipeline-enter mb-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 bg-[#F0F9FF] border-b border-[#E0F2FE] px-4 py-3">
        <Telescope size={14} strokeWidth={1.75} className="shrink-0 text-[#0369A1]" />
        <span className="flex-1 truncate text-[12px] font-semibold text-[#0369A1]">
          Deep Research{query ? `: "${query.length > 50 ? query.slice(0, 50) + "…" : query}"` : ""}
        </span>
        {isDone && elapsed && <span className="shrink-0 text-[11px] text-[#6B7280]">{elapsed}</span>}
        {!isDone && !isError && <GridLoader color="#0369A1" size={12} />}
        {isDone && <CheckCircle2 size={13} strokeWidth={2} className="shrink-0 text-[#0369A1]" />}
        {isError && <AlertCircle size={13} strokeWidth={2} className="shrink-0 text-[#DC2626]" />}
        <button type="button" onClick={() => setExpanded(e => !e)}
          className="ml-1 text-[#9CA3AF] transition-colors hover:text-[#111111]">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Steps */}
          {steps.length > 0 && (
            <div className="max-h-[200px] space-y-2 overflow-y-auto px-4 py-3">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                const StepIcon = step.action === "search" ? Search : BookOpen;
                return (
                  <div key={i} className="ma-step-enter flex items-start gap-2.5" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
                    <span className="mt-0.5 shrink-0">
                      {(!isDone && isLast)
                        ? <GridLoader color="#0369A1" size={13} />
                        : <CheckCircle2 size={13} strokeWidth={2} className="text-[#0EA5E9]" />}
                    </span>
                    <span className="text-[12px] leading-relaxed text-[#374151]">
                      {step.action === "search" ? "🔍" : step.action === "image" ? "🖼️" : "📖"} {step.message}
                    </span>
                  </div>
                );
              })}
              {!isDone && !isError && (
                <div className="flex items-center gap-2.5">
                  <GridLoader color="#0369A1" size={13} />
                  <span className="text-[12px] text-[#9CA3AF]">Melanjutkan riset...</span>
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          {!isDone && !isError && (
            <div className="px-4 pb-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-[#9CA3AF]">{steps.length} langkah · {sources.length} sumber dibaca</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div className="h-full rounded-full bg-[#0EA5E9] transition-all duration-500"
                  style={{ width: `${Math.min(steps.length * 10, 90)}%` }} />
              </div>
            </div>
          )}

          {/* Images — full-width grid, CDN prioritized */}
          {validImages.length > 0 && (
            <div className="border-t border-[#F3F4F6] px-4 pb-4 pt-3">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                <Images size={11} strokeWidth={2} />
                {validImages.length} gambar
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {validImages.map((img, i) => (
                  <a key={i} href={img.source_url || img.url} target="_blank" rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] hover:border-[#0369A1] hover:shadow-md transition-all">
                    <img
                      src={img.url}
                      alt={img.alt || query}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                      onError={() => markFailed(img.url)}
                    />
                    {img.cdn && (
                      <span className="absolute bottom-1 right-1 rounded-full bg-[#0369A1]/80 px-1 py-0.5 text-[8px] font-bold text-white">CDN</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sources found */}
          {!isDone && sourcesFound && sourcesFound.length > 0 && (
            <div className="border-t border-[#F3F4F6] px-4 pb-3 pt-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {sourcesFound.length} sumber ditemukan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sourcesFound.slice(0, 12).map((s, i) => {
                  const host = (() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 text-[11px] text-[#6B7280] transition-colors hover:bg-white hover:text-[#111111]">
                      <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(s.url)}&sz=32`}
                        alt="" className="h-3 w-3 rounded-sm" loading="lazy" />
                      <span className="max-w-[100px] truncate">{host || s.title}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sources read */}
          {sources.length > 0 && (
            <div className="border-t border-[#F3F4F6] px-4 pb-3 pt-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {sources.length} sumber dibaca
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sources.slice(0, 15).map((s, i) => {
                  const host = (() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      className="group inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 text-[11px] text-[#374151] transition-colors hover:bg-[#EFF6FF] hover:border-[#BFDBFE] hover:text-[#1D4ED8]">
                      <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(s.url)}&sz=32`}
                        alt="" className="h-3 w-3 rounded-sm" loading="lazy" />
                      <span className="max-w-[120px] truncate">{host || s.title}</span>
                      <ExternalLink size={9} strokeWidth={1.75} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary bar when done */}
          {isDone && (
            <div className="border-t border-[#F3F4F6] bg-[#F0F9FF] px-4 py-2.5">
              <p className="text-[11px] text-[#0369A1]">
                ✓ Selesai · {sources.length} sumber · {validImages.length} gambar
                {elapsed ? ` · ${elapsed}` : ""}
              </p>
            </div>
          )}

          {isError && (
            <div className="border-t border-[#FCA5A5] bg-[#FEF2F2] px-4 py-2.5">
              <p className="text-[11px] text-[#DC2626]">⚠️ Riset gagal. Coba lagi.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
