import { useState } from "react";
import {
  Globe,
  Sparkles,
  GraduationCap,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

// Grid loader component — 3x3 squares that light up in sequence
const GridLoader = ({ color = "currentColor", size = 14 }) => (
  <span
    className="ma-grid-loader"
    aria-hidden="true"
    style={{ width: size, height: size, color }}
  >
    {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
  </span>
);

const MODE_COLORS = {
  web:      { accent: "#3B6EF6", bg: "#EFF4FF" },
  expert:   { accent: "#7C3AED", bg: "#F5F3FF" },
  academic: { accent: "#0891B2", bg: "#ECFEFF" },
  social:   { accent: "#059669", bg: "#ECFDF5" },
};

const MODE_ICONS = { web: Globe, expert: Sparkles, academic: GraduationCap, social: Users };
const MODE_LABELS = { web: "Web Search", expert: "Expert Mode", academic: "Academic Mode", social: "Social Mode" };

/**
 * Web pipeline steps, each mapped to an SSE phase:
 *   step 0 — "Menyusun query"     active when phase=searching (before results arrive)
 *   step 1 — "Mencari di web"     active when phase=searching (after query is set)
 *   step 2 — "Membaca sumber"     active when phase=reading
 *   step 3 — "Mensintesis jawaban" active when phase=synthesizing OR isStreaming
 *
 * Mapping:
 *   searching → step 0 active (query composing)
 *   reading   → step 1 done, step 2 active
 *   synthesizing → step 1+2 done, step 3 active
 *   streaming → all done
 */
const WEB_STEPS = [
  { id: "query",  label: "Menyusun query" },
  { id: "search", label: "Mencari di web" },
  { id: "fetch",  label: "Membaca sumber" },
  { id: "synth",  label: "Mensintesis jawaban" },
];

// Returns { doneUpTo, activeIndex } based on phase
// doneUpTo = all steps with index < doneUpTo are done
// activeIndex = the step currently spinning
function getStepState(phase, isStreaming, isDone) {
  if (isDone || isStreaming) return { doneUpTo: 4, activeIndex: -1 };
  switch (phase) {
    case "searching":  return { doneUpTo: 0, activeIndex: 0 }; // step 0 spinning
    case "reading":    return { doneUpTo: 2, activeIndex: 2 }; // steps 0+1 done, step 2 spinning
    case "synthesizing": return { doneUpTo: 3, activeIndex: 3 }; // steps 0+1+2 done, step 3 spinning
    default:           return { doneUpTo: 0, activeIndex: 0 };
  }
}

const NON_WEB_STEPS = {
  expert: [
    { id: "analyze", label: "Menganalisis pertanyaan" },
    { id: "depth",   label: "Menyiapkan analisis mendalam" },
    { id: "detail",  label: "Menyusun detail teknis" },
    { id: "compose", label: "Menyusun respons komprehensif" },
  ],
  academic: [
    { id: "topic",   label: "Mengidentifikasi topik akademik" },
    { id: "papers",  label: "Mencari paper & jurnal" },
    { id: "cite",    label: "Mengumpulkan sitasi" },
    { id: "compose", label: "Menyusun jawaban ilmiah" },
  ],
  social: [
    { id: "topic",    label: "Mengidentifikasi topik" },
    { id: "opinions", label: "Mengumpulkan opini komunitas" },
    { id: "diverse",  label: "Menelaah perspektif beragam" },
    { id: "compose",  label: "Menyusun ringkasan diskusi" },
  ],
};

const SourceItem = ({ url, title }) => {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } })();
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2 rounded-lg px-1 py-1 text-[12px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
        alt=""
        className="h-4 w-4 shrink-0 rounded"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 truncate">{title || host}</span>
      <span className="shrink-0 text-[10px] text-[#9CA3AF]">{host}</span>
      <ExternalLink size={10} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
};

export const SearchPipeline = ({
  mode = "web",
  phase = "searching",
  webResults = [],
  webQuery = "",
  isStreaming = false,
  isDone = false,
}) => {
  const colors = MODE_COLORS[mode] || MODE_COLORS.web;
  const ModeIcon = MODE_ICONS[mode] || Globe;
  const modeLabel = MODE_LABELS[mode] || "Search";
  const isWebMode = mode === "web";
  const steps = isWebMode ? WEB_STEPS : (NON_WEB_STEPS[mode] || NON_WEB_STEPS.expert);
  const allDone = isDone || isStreaming;

  const { doneUpTo, activeIndex } = isWebMode
    ? getStepState(phase, isStreaming, isDone)
    : (() => {
        if (allDone) return { doneUpTo: steps.length, activeIndex: -1 };
        // Non-web modes: map phase to step index sequentially
        const phaseToActive = { searching: 0, reading: 1, synthesizing: 2 };
        const active = Math.min((phaseToActive[phase] ?? 0), steps.length - 1);
        return { doneUpTo: active, activeIndex: active };
      })();

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2 px-4 py-2.5 transition-colors"
        style={{ background: colors.bg, borderBottom: expanded ? `1px solid ${colors.accent}22` : "none" }}
        aria-expanded={expanded}
      >
        <ModeIcon size={13} strokeWidth={2} style={{ color: colors.accent }} />
        <span className="text-[12px] font-semibold" style={{ color: colors.accent }}>
          {modeLabel}
        </span>
        {allDone ? (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[#6B7280]">
            <CheckCircle2 size={11} strokeWidth={2} style={{ color: colors.accent }} />
            Selesai
          </span>
        ) : (
          <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: colors.accent }}>
            <GridLoader color={colors.accent} size={11} />
            {phase === "searching" ? "Mencari..." : phase === "reading" ? "Membaca..." : "Mensintesis..."}
          </span>
        )}
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content */}
      <div
        className={`transition-[max-height,opacity] duration-200 ease-out overflow-hidden ${
          expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3 space-y-2.5">
          {/* Steps */}
          <div className="pt-2 space-y-2">
            {steps.map((step, i) => {
              const stepDone = i < doneUpTo;
              const stepActive = i === activeIndex;

              return (
                <div key={step.id} className="ma-step-enter flex items-center gap-2.5" style={{ animationDelay: `${i * 0.06}s` }}>
                  <span className="shrink-0">
                    {stepDone ? (
                      <CheckCircle2 size={14} strokeWidth={2} style={{ color: colors.accent }} />
                    ) : stepActive ? (
                      <GridLoader color={colors.accent} size={14} />
                    ) : (
                      <span className="grid h-[14px] w-[14px] place-items-center rounded-full border border-[#E5E7EB]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D1D5DB]" />
                      </span>
                    )}
                  </span>
                  <span
                    className="text-[12px]"
                    style={{
                      color: stepDone ? "#6B7280" : stepActive ? colors.accent : "#9CA3AF",
                      fontWeight: stepActive ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Query label - all modes with web search */}
          {webQuery && (
            <div className="border-t border-[#F3F4F6] py-2">
              <p className="text-[11px] text-[#9CA3AF]">
                Query: <span className="font-medium text-[#6B7280]">“{webQuery}”</span>
              </p>
            </div>
          )}

          {/* Sources - show for all modes that triggered web search */}
          {webResults.length > 0 && (
            <div className="border-t border-[#F3F4F6] pt-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {mode === 'academic'
                  ? webResults.length + ' paper & jurnal ditemukan'
                  : mode === 'social'
                    ? webResults.length + ' sumber diskusi ditemukan'
                    : webResults.length + ' sumber ditemukan'}
              </p>
              <div className="space-y-0.5">
                {webResults.map((r, i) => (
                  <SourceItem key={`${r.url}-${i}`} url={r.url} title={r.title} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};