import { useState } from "react";
import { Telescope, Search, BookOpen, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const GridLoader = ({ color = "currentColor", size = 13 }) => (
  <span
    className="ma-grid-loader shrink-0"
    aria-hidden="true"
    style={{ width: size, height: size, color }}
  >
    {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
  </span>
);

/**
 * DeepResearchPanel
 * Shows live SSE progress during deep research + keeps sources visible after done.
 *
 * Props:
 *  steps       - array of { action, message, url }
 *  sources     - array of { url, title } actually read
 *  sourcesFound - array of { url, title } found during search (not necessarily read)
 *  phase       - 'running' | 'done' | 'error'
 *  query       - original research query
 *  elapsed     - time string e.g. "1m 23s"
 */
export const DeepResearchPanel = ({ steps = [], sources = [], sourcesFound = [], phase = "running", query = "", elapsed = "" }) => {
  const [expanded, setExpanded] = useState(true);
  const isDone = phase === "done";
  const isError = phase === "error";

  return (
    <div className="ma-pipeline-enter mb-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F0F9FF] border-b border-[#E0F2FE]">
        <Telescope size={14} strokeWidth={1.75} className="text-[#0369A1] shrink-0" />
        <span className="flex-1 text-[12px] font-semibold text-[#0369A1] truncate">
          Deep Research{query ? `: "${query.length > 50 ? query.slice(0, 50) + "…" : query}"` : ""}
        </span>
        {isDone && elapsed && (
          <span className="text-[11px] text-[#6B7280] shrink-0">{elapsed}</span>
        )}
        {!isDone && (
          <GridLoader color="#0369A1" size={12} />
        )}
        {isDone && (
          <CheckCircle2 size={13} strokeWidth={2} className="text-[#0369A1] shrink-0" />
        )}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="ml-1 text-[#9CA3AF] hover:text-[#111111] transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Steps */}
          {steps.length > 0 && (
            <div className="px-4 py-3 space-y-2 max-h-[240px] overflow-y-auto">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                const StepIcon = step.action === "search" ? Search : BookOpen;
                return (
                  <div key={i} className="ma-step-enter flex items-start gap-2.5" style={{animationDelay: `${Math.min(i * 0.05, 0.4)}s`}}>
                    <span className="mt-0.5 shrink-0">
                      {(!isDone && isLast) ? (
                        <GridLoader color="#0369A1" size={13} />
                      ) : (
                        <CheckCircle2 size={13} strokeWidth={2} className="text-[#0EA5E9]" />
                      )}
                    </span>
                    <span className="text-[12px] text-[#374151] leading-relaxed">
                      {step.action === "search" ? "🔍" : "📖"} {step.message}
                    </span>
                  </div>
                );
              })}
              {!isDone && (
                <div className="flex items-center gap-2.5">
                  <GridLoader color="#0369A1" size={13} />
                  <span className="text-[12px] text-[#9CA3AF]">Melanjutkan riset...</span>
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          {!isDone && (
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#9CA3AF]">{steps.length} langkah · {sources.length} sumber dibaca</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full bg-[#0EA5E9] transition-all duration-500"
                  style={{ width: `${Math.min(steps.length * 10, 90)}%` }}
                />
              </div>
            </div>
          )}

          {/* Sources found */}
          {sources.length > 0 && (
            <div className="border-t border-[#F3F4F6] px-4 pb-3 pt-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {sources.length} sumber dibaca
              </p>
              <div className="space-y-0.5">
                {sources.map((s, i) => {
                  const host = (() => { try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return s.url; } })();
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 rounded-lg px-1 py-1 text-[12px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(s.url)}&sz=32`}
                        alt=""
                        className="h-4 w-4 shrink-0 rounded"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1 truncate">{s.title || host}</span>
                      <span className="shrink-0 text-[10px] text-[#9CA3AF]">{host}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {isDone && elapsed && (
            <div className="border-t border-[#F3F4F6] px-4 py-2">
              <p className="text-[11px] text-[#9CA3AF]">
                Riset selesai dalam <span className="font-medium text-[#6B7280]">{elapsed}</span> · {sources.length} sumber · {steps.length} langkah
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
