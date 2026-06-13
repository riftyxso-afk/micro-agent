import { useEffect, useState } from "react";
import { Wand2, Zap, CircleAlert, RotateCcw } from "lucide-react";
import { ThinkingBlock } from "@/components/chat/ThinkingBlock";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
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

export const AssistantMessage = ({ message, onRetry }) => {
  const [thinkingOpen, setThinkingOpen] = useState(true);

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
      <div className="w-full max-w-full rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:max-w-[92%] sm:p-6">
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

            {message.state === "completed" && message.code && (
              <CodeBlock code={message.code} />
            )}

            {message.state === "completed" && message.stopped && (
              <p className="mt-3 text-xs italic text-[#9CA3AF]">
                Generation stopped
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
