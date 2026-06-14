import { useEffect, useState, useCallback, useMemo } from "react";
import { Wand2, Zap, CircleAlert, RotateCcw, Download, Search, ExternalLink, ChevronDown } from "lucide-react";
import { ThinkingBlock } from "@/components/chat/ThinkingBlock";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { ClarificationOptions } from "@/components/chat/ClarificationOptions";
import { ModelIcon } from "@/components/workspace/ModelIcon";

export const UserMessage = ({ message }) => (
  <div className="ma-msg-in flex justify-end" data-testid="user-message">
    <div className="max-w-[90%] rounded-2xl rounded-br-lg bg-[#EDEEF1] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#111111] sm:max-w-[75%] sm:rounded-3xl sm:px-5 sm:py-3 sm:text-[15px]">
      {message.text}
    </div>
  </div>
);

const AssistantHeader = ({ message }) => {
  const generating =
    message.state === "pending" ||
    message.state === "thinking" ||
    message.state === "streaming";

  return (
    <div
      data-testid="assistant-header"
      className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5"
    >
      <span className="grid h-6 w-6 place-items-center rounded-lg border border-[#F0F1F3] bg-[#FAFAFA]">
        <ModelIcon model={message.model} size={18} />
      </span>
      <span
        data-testid="assistant-model-name"
        className="text-[13.5px] font-medium text-[#111111]"
      >
        {message.model.name}
      </span>

      {message.autoMode && (
        <span
          data-testid="assistant-auto-label"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#E0F2FE] to-[#EDE9FE] px-2 py-0.5 text-[11px] font-medium text-[#4338CA]"
        >
          <Wand2 size={10} strokeWidth={2.25} />
          Auto Mode
        </span>
      )}

      {!generating && message.state !== "error" && (
        <span
          data-testid="assistant-credit-cost"
          className="inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280]"
        >
          <Zap
            size={10}
            strokeWidth={2.25}
            className="fill-[#F59E0B] text-[#F59E0B]"
          />
          {message.model.credits}
        </span>
      )}

      <span
          data-testid="assistant-status"
          className="text-xs text-[#9CA3AF]"
        >
          {generating ? (
            <span className="ma-shimmer-text">· generating...</span>
          ) : message.state === "error" ? (
            "· failed"
          ) : (
            `· ${message.status || "just now"}`
          )}
        </span>
      </div>
  );
};

export const AssistantMessage = ({ message, onRetry, onRefine }) => {
  const [thinkingOpen, setThinkingOpen] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const handleDownload = useCallback(() => {
    const content = message.text || "";
    const filename = `response-${message.model?.id || "ai"}.md`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [message.text, message.model]);

  // Auto-collapse thinking once the answer completes; keep it accessible
  useEffect(() => {
    if (message.state === "completed") {
      const t = setTimeout(() => setThinkingOpen(false), 600);
      return () => clearTimeout(t);
    }
    if (
      message.state === "thinking" ||
      message.state === "pending" ||
      message.state === "streaming"
    ) {
      setThinkingOpen(true);
    }
  }, [message.state]);

  if (message.state === "error") {
    return (
      <div
        className="ma-msg-in flex justify-start"
        data-testid="assistant-message"
        data-state="error"
      >
        <div className="w-full max-w-full rounded-[24px] border border-[#FECACA] bg-[#FEF2F2] p-5 sm:max-w-[92%]">
          <AssistantHeader message={message} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-[#991B1B]">
              <CircleAlert size={16} strokeWidth={1.75} />
              Something went wrong. Try again.
            </span>
            <button
              type="button"
              data-testid="retry-button"
              onClick={() => onRetry(message.id)}
              className="ma-focus inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 text-[13px] font-medium text-[#991B1B] transition-colors duration-150 ease-out hover:bg-[#FEE2E2] active:scale-[0.98]"
            >
              <RotateCcw size={13} strokeWidth={2} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = message.state === "pending";

  return (
    <div
      className="ma-msg-in flex justify-start"
      data-testid="assistant-message"
      data-state={message.state}
    >
      <div className="w-full max-w-full rounded-[24px] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.06)] sm:max-w-[92%] sm:p-6">
        <AssistantHeader message={message} />

        {isPending ? (
          <div className="space-y-2.5 py-1" data-testid="pending-shimmer">
            <div className="ma-shimmer h-3.5 w-2/5 rounded-full" />
            <div className="ma-shimmer h-3.5 w-3/5 rounded-full" />
          </div>
        ) : (
          <>
            <ThinkingBlock
              state={message.state}
              open={thinkingOpen}
              onToggle={() => setThinkingOpen((o) => !o)}
              steps={message.thinkingSteps}
              reasoningText={message.reasoningText}
            />

            {(message.state === "streaming" ||
              message.state === "completed") && (
              <div className="relative">
                <MarkdownMessage text={message.text} />
                {message.state === "streaming" && (
                  <span className="ma-caret ml-0.5 align-baseline" aria-hidden="true" />
                )}
              </div>
            )}

            {message.state === "clarifying" && message.clarifyOptions && (
              <ClarificationOptions
                message={message}
                onRefine={(refined) => onRefine?.(message.id, refined)}
              />
            )}

            {message.state === "completed" && message.text && message.thinkingSteps?.filter(s => typeof s === "object" && s.type === "web_result").length > 0 && (
              <div className="mt-3" data-testid="sources-section">
                <button
                  type="button"
                  onClick={() => setSourcesOpen((o) => !o)}
                  className="ma-focus inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
                >
                  <Search size={12} strokeWidth={1.75} />
                  {message.thinkingSteps.filter(s => typeof s === "object" && s.type === "web_result").length} sources
                  <ChevronDown size={12} strokeWidth={2} className={`transition-transform duration-200 ${sourcesOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`ma-collapse ${sourcesOpen ? "ma-collapse-open" : ""}`} aria-hidden={!sourcesOpen}>
                  <div className="overflow-hidden">
                    <div className="ml-[5px] mt-2 border-l-2 border-[#E5E7EB] pl-4">
                      {message.thinkingSteps.filter(s => typeof s === "object" && s.type === "web_result").map((src, i) => {
                        const host = (() => { try { return new URL(src.url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
                        return (
                          <a key={`${src.url}-${i}`} href={src.url} target="_blank" rel="noreferrer" className="ma-focus group relative mb-3 flex items-center gap-2.5 rounded-xl px-1 py-1 last:mb-0 text-xs text-[#6B7280] transition-colors hover:text-[#111111]">
                            <span className="absolute -left-[21px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[#E5E7EB] bg-white" />
                            <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(src.url)}&sz=32`} alt="" className="h-4 w-4 rounded" loading="lazy" />
                            <span className="min-w-0 flex-1 truncate">{host || src.title}</span>
                            <ExternalLink size={11} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF] opacity-0 transition-opacity group-hover:opacity-100" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message.state === "completed" && message.code && (
              <CodeBlock code={message.code} />
            )}

            {message.state === "completed" && message.stopped && (
              <p className="mt-3 text-xs italic text-[#9CA3AF]">
                Generation stopped
              </p>
            )}

            {message.state === "completed" && message.text && (
              <button
                type="button"
                data-testid="download-response-button"
                aria-label="Download as Markdown"
                onClick={handleDownload}
                className="ma-focus mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] hover:text-[#111111]"
              >
                <Download size={13} strokeWidth={1.75} />
                Download as .md
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
