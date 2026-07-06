import { useState, useEffect, useRef, useCallback } from "react";
import {
  Wand2, CircleAlert, RotateCcw, Search,
  ExternalLink, ChevronDown, Copy, Check, Download,
  FileText, FileSpreadsheet, Presentation, File, Image,
} from "lucide-react";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { ClarificationOptions } from "@/components/chat/ClarificationOptions";
import { ModelIcon } from "@/components/workspace/ModelIcon";
import { DocumentDownloadMenu } from "@/components/chat/DocumentDownloadMenu";
import { QnaCard } from "@/components/chat/QnaCard";
import { AiLoadingStream } from "@/components/chat/AiLoadingStream";

const getFileIcon = (name) => {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (["pdf"].includes(ext)) return { Icon: FileText, color: "text-red-500", bg: "bg-red-50 border-red-200", label: "PDF" };
  if (["docx","doc"].includes(ext)) return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50 border-blue-200", label: "DOC" };
  if (["xlsx","xls"].includes(ext)) return { Icon: FileSpreadsheet, color: "text-green-500", bg: "bg-green-50 border-green-200", label: "XLS" };
  if (["pptx","ppt"].includes(ext)) return { Icon: Presentation, color: "text-orange-500", bg: "bg-orange-50 border-orange-200", label: "PPT" };
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return { Icon: Image, color: "text-purple-500", bg: "bg-purple-50 border-purple-200", label: "IMG" };
  if (["txt","csv","md"].includes(ext)) return { Icon: FileText, color: "text-gray-500", bg: "bg-gray-50 border-gray-200", label: ext.toUpperCase() };
  return { Icon: File, color: "text-gray-400", bg: "bg-gray-50 border-gray-200", label: "FILE" };
};

const FileChip = ({ f }) => {
  const { Icon, color, bg, label } = getFileIcon(f.name);
  const isImage = f.preview && ["jpg","jpeg","png","gif","webp"].some(e => (f.name||"").toLowerCase().endsWith(e));
  if (isImage) return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
      <img src={f.preview} alt={f.name} className="h-8 w-8 object-cover" />
      <span className="max-w-[120px] truncate pr-2.5 text-xs font-medium text-[#374151]">{f.name}</span>
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium text-[#374151] shadow-sm ${bg}`}>
      <Icon size={13} strokeWidth={1.75} className={color} />
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
      <span className="max-w-[140px] truncate text-[#374151]">{f.name}</span>
    </span>
  );
};

// ── UserMessage ────────────────────────────────────────────────────────────────

export const UserMessage = ({ message }) => (
  <div className="ma-msg-in flex justify-end" data-testid="user-message">
    <div className="max-w-[80%] sm:max-w-[70%] space-y-2">
      {message.uploadedFiles?.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {message.uploadedFiles.map((f, i) => <FileChip key={i} f={f} />)}
        </div>
      )}
      {message.text && (
        <div className="rounded-2xl rounded-br-md bg-[#EDEEF1] px-4 py-2.5 text-[14px] leading-relaxed text-[#111111] sm:px-5 sm:py-3 sm:text-[15px]">
          {message.text}
        </div>
      )}
    </div>
  </div>
);

// ── AssistantHeader ────────────────────────────────────────────────────────────

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
          className="inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280] [&_svg]:text-[#6B7280]"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {message.model.credits}
        </span>
      )}

      {!generating && message.state !== "error" && (
        <span data-testid="assistant-status" className="text-xs text-[#9CA3AF]">
          {`· ${message.status || "just now"}`}
        </span>
      )}
    </div>
  );
};

// ── CopyButton ─────────────────────────────────────────────────────────────────

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      data-testid="copy-response-button"
      aria-label={copied ? "Copied" : "Copy response"}
      onClick={handleCopy}
      className="ma-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] hover:text-[#111111]"
    >
      {copied ? (
        <Check size={13} strokeWidth={1.75} className="text-[#22C55E]" />
      ) : (
        <Copy size={13} strokeWidth={1.75} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ── AssistantMessage ───────────────────────────────────────────────────────────

export const AssistantMessage = ({ message, onRetry, onRefine, onAbort }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const userToggledRef = useRef(false);

  // ── Error state ────────────────────────────────────────────────────────────
  if (message.state === "error") {
    return (
      <div
        className="ma-msg-in flex justify-start"
        data-testid="assistant-message"
        data-state="error"
      >
        <div className="w-full max-w-full p-5 sm:max-w-[92%]">
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

  const isGenerating = message.state === "pending" ||
    message.state === "thinking" ||
    message.state === "streaming";

  return (
    <div
      className="ma-msg-in flex justify-start"
      data-testid="assistant-message"
      data-state={message.state}
    >
      <div
        className="w-full max-w-full p-5 sm:p-6"
      >
        <AssistantHeader message={message} />

        {/* ── Unified status line (collapsed): single bar, expandable detail ── */}
        {isGenerating && (
          <AiLoadingStream
            message={message}
            webSearchEnabled={message.searchMode && message.searchMode !== "off"}
            onAbort={onAbort}
          />
        )}

        {/* ── Skill loading badge ── */}
        {message.skillSlug &&
          message.skillPhase === "loading" &&
          (message.state === "pending" || message.state === "thinking") && (
            <div className="ma-fade-in mb-3 flex items-center gap-3 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-2.5">
              <div
                className="ma-grid-loader"
                style={{ width: 14, height: 14, color: "#4338CA" }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <span key={i} />
                ))}
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#4338CA]">
                  Loading skill:{" "}
                  {message.skillSlug
                    ?.replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <p className="text-[11px] text-[#6366F1]/70">
                  Applying instructions...
                </p>
              </div>
            </div>
          )}

        
        {/* ── Image result ── */}
        {message.state === "completed" && message.imageUrl && (
          <div className="mt-1">
            <img
              src={message.imageUrl}
              alt={message.prompt || "Generated image"}
              className="w-full max-w-[480px] rounded-2xl border border-[#E5E7EB] shadow-sm"
              loading="lazy"
            />
            <a
              href={message.imageUrl}
              download="generated-image.png"
              target="_blank"
              rel="noreferrer"
              className="ma-focus mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
            >
              <Download size={13} strokeWidth={1.75} />
              Unduh Gambar
            </a>
          </div>
        )}

        {/* ── Streaming/completed text ── */}
        {(message.state === "streaming" ||
          (message.state === "completed" && !message.imageUrl)) &&
          message.text && (
            <div className="relative">
              <MarkdownMessage text={message.text} />
              {message.state === "streaming" && (
                <span
                  className="ma-caret ml-0.5 align-baseline"
                  aria-hidden="true"
                />
              )}
            </div>
          )}

        {/* ── Image generating shimmer ── */}
        {message.state === "streaming" && !message.text && (
          <div className="space-y-2.5 py-1" data-testid="image-generating-shimmer">
            <div className="ma-shimmer h-[200px] w-[200px] rounded-2xl" />
          </div>
        )}

        {/* ── QNA clarification ── */}
        {message.state === "clarifying" && message.qna && (
          <div className="mt-1">
            {message.text && (
              <p className="mb-3 text-[14px] leading-relaxed text-[#1F2937]">
                {message.text}
              </p>
            )}
            <QnaCard
              preText={message.qna.pre_text}
              question={message.qna.question}
              options={message.qna.options || []}
              allowCustom={message.qna.allow_custom}
              onAnswer={(answer) => onRefine?.(message.id, answer)}
            />
          </div>
        )}

        {/* ── Legacy clarification ── */}
        {message.state === "clarifying" &&
          message.clarifyOptions &&
          !message.qna && (
            <ClarificationOptions
              message={message}
              onRefine={(refined) => onRefine?.(message.id, refined)}
            />
          )}

        {/* ── Web sources (completed) ── */}
        {message.state === "completed" &&
          message.text &&
          message.thinkingSteps?.filter(
            (s) => typeof s === "object" && s.type === "web_result",
          ).length > 0 && (
            <div className="mt-3" data-testid="sources-section">
              <button
                type="button"
                onClick={() => setSourcesOpen((o) => !o)}
                className="ma-focus inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
              >
                <Search size={12} strokeWidth={1.75} />
                {
                  message.thinkingSteps.filter(
                    (s) => typeof s === "object" && s.type === "web_result",
                  ).length
                }{" "}
                sources
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  className={`transition-transform duration-200 ${sourcesOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`ma-collapse ${sourcesOpen ? "ma-collapse-open" : ""}`}
                aria-hidden={!sourcesOpen}
              >
                <div className="overflow-hidden">
                  <div className="ml-[5px] mt-2 border-l-2 border-[#E5E7EB] pl-4">
                    {message.thinkingSteps
                      .filter(
                        (s) => typeof s === "object" && s.type === "web_result",
                      )
                      .map((src, i) => {
                        const host = (() => {
                          try {
                            return new URL(src.url).hostname.replace(
                              /^www\./,
                              "",
                            );
                          } catch {
                            return "";
                          }
                        })();
                        return (
                          <a
                            key={`${src.url}-${i}`}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ma-focus group relative mb-3 flex items-center gap-2.5 rounded-xl px-1 py-1 text-xs text-[#6B7280] transition-colors last:mb-0 hover:text-[#111111]"
                          >
                            <span className="absolute -left-[21px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[#E5E7EB] bg-white" />
                            <img
                              src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(src.url)}&sz=32`}
                              alt=""
                              className="h-4 w-4 rounded"
                              loading="lazy"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {host || src.title}
                            </span>
                            <ExternalLink
                              size={11}
                              strokeWidth={1.75}
                              className="shrink-0 text-[#9CA3AF] opacity-0 transition-opacity group-hover:opacity-100"
                            />
                          </a>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ── Code block (completed) ── */}
        {message.state === "completed" && message.code && (
          <CodeBlock code={message.code} />
        )}

        {/* ── Stopped notice ── */}
        {message.state === "completed" && message.stopped && (
          <p className="mt-3 text-xs italic text-[#9CA3AF]">
            Generation stopped
          </p>
        )}

        {/* ── Document download + copy (completed) ── */}
        {message.state === "completed" &&
          message.text &&
          (() => {
            const isDocReady = message.text.includes("[DOKUMEN SIAP]");
            const cleanText = message.text
              .replace(/^>\s*\*\*\[DOKUMEN SIAP\]\*\*.*$/m, "")
              .trim();
            const docTitle = message.prompt
              ? message.prompt.length > 60
                ? message.prompt.slice(0, 60).trim()
                : message.prompt
              : "MicroAgent Response";
            return (
              <div className="mt-3">
                {isDocReady && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#E0F2FE] bg-[#F0F9FF] px-3 py-2">
                    <span className="text-[13px]">📄</span>
                    <p className="flex-1 text-[12px] font-medium text-[#0369A1]">
                      Dokumen siap diunduh
                    </p>
                    <DocumentDownloadMenu
                      content={cleanText}
                      title={docTitle}
                      modelId={message.model?.id}
                      highlight
                    />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CopyButton text={cleanText} />
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};
