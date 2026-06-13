import { ChevronDown, Search } from "lucide-react";
import { THINKING_STEPS } from "@/lib/workspaceData";

const hostFromUrl = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const faviconUrl = (url = "") =>
  url ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32` : "";

export const ThinkingBlock = ({ state, open, onToggle, steps }) => {
  const items = steps?.length ? steps : THINKING_STEPS;
  const isWorking = state === "thinking" || state === "pending";

  return (
    <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(17,24,39,0.04)]" data-testid="thinking-block">
      <button
        type="button"
        data-testid="thinking-toggle"
        aria-expanded={open}
        onClick={onToggle}
        className="ma-focus group inline-flex items-center gap-1.5 rounded-lg py-1 text-[13px] font-semibold text-[#111111] transition-colors duration-150 ease-out hover:text-[#4D6BFE]"
      >
        <span>Thinking</span>
        {isWorking && (
          <span className="ma-typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-[#9CA3AF] transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`ma-collapse ${open ? "ma-collapse-open" : ""}`} aria-hidden={!open}>
        <div className="overflow-hidden">
          <div data-testid="thinking-content" className="mt-2 border-l border-[#E5E7EB] pl-4">
            {items.map((step, i) => {
              if (typeof step === "object" && step?.type === "web_result") {
                const host = hostFromUrl(step.url);
                return (
                  <a
                    key={`${step.url || step.title}-${i}`}
                    href={step.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ma-focus mb-2 flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 text-[13px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111] last:mb-0"
                  >
                    {step.url ? (
                      <img
                        src={faviconUrl(step.url)}
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 rounded"
                        loading="lazy"
                      />
                    ) : (
                      <Search size={14} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{step.title}</span>
                    {host && <span className="hidden shrink-0 text-xs text-[#9CA3AF] sm:inline">{host}</span>}
                  </a>
                );
              }

              return (
                <p key={`${step}-${i}`} className="mb-2 last:mb-0 text-[13.5px] leading-relaxed text-[#6B7280]">
                  {step}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
