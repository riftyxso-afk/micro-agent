import { useState } from "react";
import {
  ChevronDown,
  Globe,
  CheckCircle2,
  ExternalLink,
  Search,
} from "lucide-react";

/**
 * Multi-phase status line + expandable detail panel.
 * Supports multiple concurrent active phases (e.g. thinking + searching).
 * Collapsed: one or more status lines stacked vertically.
 * Expanded: reasoning text, search query, sources, web-steps.
 */
export const AiLoadingStream = ({
  message,
  onAbort,
  webSearchEnabled,
}) => {
  const [expanded, setExpanded] = useState(false);
  if (!message) return null;

  const { state, status, webPhase, reasoningText, webQuery, webResults, thinkingSteps } = message;

  if (state === "completed" || state === "error") return null;

  // ── Build list of active phases ──────────────────────────────
  const activePhases = [];

  // Phase: thinking — active when reasoning is happening or initial pending
  const isThinking =
    status === "reasoning" ||
    (reasoningText && reasoningText.length > 0) ||
    (state === "pending" && !webPhase) ||
    (state === "thinking" && !webPhase);

  // Phase: searching — active when web search is running
  const isSearching =
    webPhase && (webPhase === "searching" || webPhase === "reading" || webPhase === "synthesizing");

  // Phase: writing — active when streaming tokens
  const isWriting = state === "streaming";

  // Priority order: writing > searching > thinking (mutual exclusive)
  if (isWriting) {
    activePhases.push({ id: "writing", label: "Writing", icon: "writing" });
  } else if (isSearching) {
    const searchLabels = {
      searching: "Searching the web",
      reading: "Reading sources",
      synthesizing: "Synthesizing",
    };
    activePhases.push({
      id: "searching",
      label: searchLabels[webPhase] || "Searching the web",
      icon: "globe",
    });
  } else if (isThinking) {
    activePhases.push({ id: "thinking", label: "Thinking", icon: "brain" });
  }

  // Fallback: if no phases detected but still generating
  if (activePhases.length === 0) {
    activePhases.push({ id: "thinking", label: "Thinking", icon: "brain" });
  }

  const hasDetail =
    reasoningText ||
    webSearchEnabled ||
    webQuery ||
    webResults?.length > 0 ||
    thinkingSteps?.length > 0;

  const BrainIcon = () => (
    <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.4618 4.04658C14.6652 4.86901 15.8624 5.85918 17.0015 6.99832C18.1407 8.13749 19.1309 9.3347 19.9533 10.5382C20.6544 9.16072 21.0758 7.8564 21.2064 6.72484C21.371 5.29776 21.0678 4.24334 20.4122 3.58772C19.7566 2.9321 18.7022 2.62887 17.2751 2.79353C16.1435 2.92409 14.8392 3.34552 13.4618 4.04658ZM20.8687 11.9999C21.8741 10.2347 22.5142 8.47649 22.6965 6.89677C22.8915 5.20639 22.5677 3.6219 21.4729 2.52706C20.378 1.43222 18.7935 1.10838 17.1032 1.30341C15.5235 1.48568 13.7652 2.12579 12.0001 3.13117C10.235 2.12585 8.47679 1.48578 6.89713 1.30354C5.2068 1.10853 3.62236 1.43238 2.52754 2.5272C1.43272 3.62203 1.10888 5.20649 1.3039 6.89684C1.48615 8.47654 2.12623 10.2347 3.13159 11.9999C2.12632 13.765 1.48629 15.5231 1.30408 17.1027C1.10909 18.793 1.43295 20.3774 2.52774 21.4722C3.62254 22.567 5.20694 22.8909 6.89723 22.6959C8.47686 22.5137 10.235 21.8736 12.0001 20.8684C13.7652 21.8737 15.5234 22.5138 17.1031 22.696C18.7934 22.891 20.3778 22.5672 21.4727 21.4724C22.5675 20.3775 22.8913 18.7931 22.6963 17.1028C22.5141 15.5231 21.874 13.765 20.8687 11.9999ZM19.1195 11.9999C18.2825 10.6747 17.2143 9.33237 15.9409 8.05898C14.6675 6.78562 13.3252 5.71736 12.0001 4.88044C10.6751 5.71734 9.3328 6.78555 8.05951 8.05884C6.78609 9.33228 5.71778 10.6747 4.88085 11.9999C5.71776 13.3249 6.78599 14.6672 8.05932 15.9406C9.33267 17.2139 10.675 18.2822 12.0001 19.1191C13.3252 18.2822 14.6677 17.2139 15.9411 15.9404C17.2144 14.6671 18.2826 13.3249 19.1195 11.9999ZM13.4618 19.953C14.6653 19.1305 15.8625 18.1403 17.0017 17.0011C18.1408 15.862 19.1309 14.6649 19.9533 13.4616C20.6543 14.839 21.0757 16.1432 21.2062 17.2747C21.3708 18.7017 21.0676 19.7561 20.412 20.4117C19.7564 21.0673 18.702 21.3705 17.275 21.2059C16.1435 21.0754 14.8392 20.654 13.4618 19.953ZM10.5383 19.9529C9.33492 19.1305 8.13777 18.1404 6.99866 17.0012C5.85956 15.8621 4.86943 14.665 4.04702 13.4616C3.34607 14.839 2.92471 16.1432 2.79419 17.2746C2.62958 18.7016 2.93281 19.756 3.5884 20.4116C4.24399 21.0672 5.29835 21.3704 6.72534 21.2058C7.85681 21.0752 9.161 20.6539 10.5383 19.9529ZM4.04699 10.5381C4.86944 9.33463 5.85966 8.13738 6.99885 6.99819C8.13792 5.85912 9.33502 4.869 10.5384 4.0466C9.16098 3.34559 7.85673 2.9242 6.72522 2.79366C5.29819 2.62903 4.2438 2.93226 3.58821 3.58786C2.9326 4.24347 2.62937 5.29787 2.79401 6.72493C2.92456 7.85646 3.34596 9.16073 4.04699 10.5381ZM12.0002 10.2497C11.0337 10.2497 10.2502 11.0332 10.2502 11.9997C10.2502 12.9662 11.0337 13.7497 12.0002 13.7497C12.9667 13.7497 13.7502 12.9662 13.7502 11.9997C13.7502 11.0332 12.9667 10.2497 12.0002 10.2497ZM8.7502 11.9997C8.7502 10.2048 10.2053 8.74971 12.0002 8.74971C13.7951 8.74971 15.2502 10.2048 15.2502 11.9997C15.2502 13.7946 13.7951 15.2497 12.0002 15.2497C10.2053 15.2497 8.7502 13.7946 8.7502 11.9997Z" fill="currentColor" />
    </svg>
  );

  const GlobeIcon = () => (
    <svg
      className="shrink-0"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );

  const WritingIcon = () => (
    <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );

  const getIcon = (icon) => {
    if (icon === "globe") return <GlobeIcon />;
    if (icon === "writing") return <WritingIcon />;
    return <BrainIcon />;
  };

  return (
    <div className="mb-2 py-1">
      {/* ── Status bars ────────────────────────────────────────── */}
      <div className="space-y-1">
        {activePhases.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="ma-icon-shimmer shrink-0 text-[#6B7280]">
              {getIcon(p.icon)}
            </span>
            <span className="text-[12px] font-medium ma-label-shimmer">
              {p.label}
            </span>
            {/* Expand/cancel only on last row */}
            {i === activePhases.length - 1 && (
              <>
                {hasDetail && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    aria-label={expanded ? "Collapse details" : "Expand details"}
                    className="rounded p-0.5 text-[#D1D5DB] transition-colors hover:bg-[#F3F4F6] hover:text-[#9CA3AF]"
                  >
                    <ChevronDown
                      size={11}
                      strokeWidth={2.5}
                      className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
                <div className="ml-auto" />
                {onAbort && (
                  <button
                    type="button"
                    onClick={onAbort}
                    aria-label="Stop generating"
                    className="rounded p-0.5 text-[#D1D5DB] transition-colors hover:bg-[#F3F4F6] hover:text-[#9CA3AF]"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Expandable detail panel ────────────────────────────── */}
      <div
        className={`transition-[max-height,opacity] duration-200 ease-out overflow-hidden ${
          expanded ? "max-h-[800px] opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 py-2.5 space-y-2 text-[12px] text-[#6B7280]">
          {/* Reasoning text */}
          {reasoningText && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Reasoning
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">
                {reasoningText}
              </p>
            </div>
          )}

          {/* Web search steps */}
          {webSearchEnabled && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Globe size={12} strokeWidth={1.75} className="text-[#9CA3AF]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Web Search
                </span>
              </div>
              {[
                { id: "query", label: "Menyusun query" },
                { id: "search", label: "Mencari di web" },
                { id: "fetch", label: "Membaca sumber" },
                { id: "synth", label: "Mensintesis jawaban" },
              ].map((step, i) => {
                const phaseOrder = ["searching", "searching", "reading", "synthesizing"];
                const currentIdx = phaseOrder.indexOf(webPhase);
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 size={12} strokeWidth={2} className="shrink-0 text-[#3B6EF6]" />
                    ) : active ? (
                      <svg className="ma-think-spin shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B6EF6" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    ) : (
                      <span className="grid h-[12px] w-[12px] shrink-0 place-items-center">
                        <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                      </span>
                    )}
                    <span style={{ color: done ? "#6B7280" : active ? "#3B6EF6" : "#9CA3AF", fontWeight: active ? 500 : 400 }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Query */}
          {webQuery && (
            <p className="text-[11px] text-[#9CA3AF]">
              Query: <span className="font-medium text-[#6B7280]">“{webQuery}”</span>
            </p>
          )}

          {/* Sources */}
          {webResults?.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {webResults.length} sumber ditemukan
              </p>
              <div className="space-y-0.5">
                {webResults.map((r, i) => {
                  let host = "";
                  try { host = new URL(r.url).hostname.replace(/^www\./, ""); } catch { host = r.url; }
                  return (
                    <a
                      key={`${r.url}-${i}`}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 rounded-lg px-1 py-0.5 text-[12px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(r.url)}&sz=32`}
                        alt=""
                        className="h-3.5 w-3.5 shrink-0 rounded"
                        loading="lazy"
                      />
                      <span className="min-w-0 flex-1 truncate">{r.title || host}</span>
                      <span className="shrink-0 text-[10px] text-[#9CA3AF]">{host}</span>
                      <ExternalLink size={9} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thinking steps (non-web) */}
          {thinkingSteps?.filter((s) => typeof s !== "object").length > 0 && (
            <div>
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Thinking
              </p>
              {thinkingSteps.filter((s) => typeof s !== "object").map((step, i) => (
                <p key={i} className="leading-relaxed">{step}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};