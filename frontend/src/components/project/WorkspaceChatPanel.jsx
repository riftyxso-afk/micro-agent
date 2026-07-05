import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  Mic,
  ChevronDown,
  ArrowUp,
  Bookmark,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  Zap,
  Wand2,
  Palette,
  Globe,
  FileText,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Skeleton loader for chat history ─────────────────────────────────────────
function ChatSkeleton() {
  return (
    <div className="pw-chat-skeleton" aria-label="Loading messages" aria-busy="true">
      {/* User bubble skeleton */}
      <div className="flex justify-end">
        <div className="pw-skeleton h-8 w-48 rounded-2xl" />
      </div>
      {/* AI card skeleton */}
      <div className="pw-skeleton h-28 w-full rounded-xl" />
      {/* User bubble skeleton */}
      <div className="flex justify-end">
        <div className="pw-skeleton h-8 w-36 rounded-2xl" />
      </div>
      {/* AI card skeleton */}
      <div className="pw-skeleton h-36 w-full rounded-xl" />
    </div>
  );
}

// ── Task summary card ─────────────────────────────────────────────────────────
function TaskSummaryCard({ message, expanded, onToggleExpand }) {
  const [activeTab, setActiveTab] = useState("details");
  const isLong = message.description && message.description.length > 200;

  return (
    <article className="pw-task-card" aria-label={`Task: ${message.title}`}>
      {/* Header */}
      <div className="pw-task-card-header">
        <h3 className="pw-task-title">{message.title}</h3>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Bookmark task"
              className="pw-task-action-btn flex-shrink-0"
            >
              <Bookmark size={14} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Bookmark</TooltipContent>
        </Tooltip>
      </div>

      {/* Tabs */}
      <div className="pw-task-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "details"}
          onClick={() => setActiveTab("details")}
          className={`pw-task-tab${activeTab === "details" ? " active" : ""}`}
        >
          Details
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          className={`pw-task-tab${activeTab === "preview" ? " active" : ""}`}
        >
          Preview
        </button>
      </div>

      {/* Description */}
      {activeTab === "details" && (
        <div className="pw-task-desc">
          <p className={isLong && !expanded ? "pw-ai-card-text collapsed" : "pw-ai-card-text"}>
            {message.description}
          </p>
          {isLong && (
            <button
              type="button"
              className="pw-show-more-btn"
              onClick={onToggleExpand}
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {activeTab === "preview" && (
        <div className="pw-task-desc text-[#9CA3AF] italic text-[12px]">
          Preview panel on the right shows the latest state.
        </div>
      )}

      {/* Action row */}
      <div className="pw-task-actions">
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Undo" className="pw-task-action-btn">
              <RotateCcw size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Undo</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Thumbs up" className="pw-task-action-btn">
              <ThumbsUp size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Good response</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Thumbs down" className="pw-task-action-btn">
              <ThumbsDown size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Bad response</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Copy" className="pw-task-action-btn">
              <Copy size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Copy</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="More actions" className="pw-task-action-btn">
              <MoreHorizontal size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">More</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}

// ── Plain AI text card ────────────────────────────────────────────────────────
function AiTextCard({ message, expanded, onToggleExpand }) {
  const isLong = message.content && message.content.length > 300;

  return (
    <article className="pw-ai-card" aria-label="AI response">
      <div className="pw-ai-card-body">
        <p className={isLong && !expanded ? "pw-ai-card-text collapsed" : "pw-ai-card-text"}>
          {message.content}
        </p>
        {isLong && (
          <button
            type="button"
            className="pw-show-more-btn"
            onClick={onToggleExpand}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      {/* Action row */}
      <div className="pw-task-actions">
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Copy" className="pw-task-action-btn">
              <Copy size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Copy</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Thumbs up" className="pw-task-action-btn">
              <ThumbsUp size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Good</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Thumbs down" className="pw-task-action-btn">
              <ThumbsDown size={13} strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Bad</TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}

// ── Quick chips ───────────────────────────────────────────────────────────────
const CONTEXT_CHIPS = [
  { id: "add-section",    label: "Add section",     icon: Plus },
  { id: "change-colors",  label: "Change colors",   icon: Palette },
  { id: "add-animation",  label: "Add animation",   icon: Wand2 },
  { id: "add-cta",        label: "Add CTA",          icon: Zap },
  { id: "seo",            label: "Improve SEO",      icon: Globe },
  { id: "copy",           label: "Rewrite copy",     icon: FileText },
];

function QuickChips({ onChipClick }) {
  return (
    <div className="pw-chips-row" role="list" aria-label="Quick actions">
      {CONTEXT_CHIPS.map((chip) => {
        const Icon = chip.icon;
        return (
          <button
            key={chip.id}
            type="button"
            role="listitem"
            aria-label={chip.label}
            data-testid={`pw-chip-${chip.id}`}
            onClick={() => onChipClick?.(chip.label)}
            className="pw-chip"
          >
            <Icon size={11} strokeWidth={2} className="text-[#9CA3AF]" />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Chat input ────────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend?.(value.trim());
    setValue("");
  };

  return (
    <div className="pw-chat-input-area">
      <div className="pw-chat-input-card">
        <textarea
          ref={textareaRef}
          className="pw-chat-textarea"
          placeholder="Ask Builder to edit this project..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={disabled}
          aria-label="Chat with Builder"
          data-testid="pw-chat-input"
        />
        <div className="pw-chat-toolbar">
          <div className="flex items-center gap-1">
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Attach file"
                  className="pw-task-action-btn"
                  data-testid="pw-attach-btn"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Attach</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Select mode"
              className="builder-mode-pill"
              data-testid="pw-mode-btn"
              style={{ padding: "3px 8px", fontSize: 11 }}
            >
              <Zap size={10} strokeWidth={2} className="text-[#6366F1]" />
              Build
              <ChevronDown size={10} strokeWidth={2} className="text-[#9CA3AF]" />
            </button>

            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Voice input"
                  className="pw-task-action-btn"
                  data-testid="pw-mic-btn"
                >
                  <Mic size={13} strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Voice</TooltipContent>
            </Tooltip>

            <button
              type="button"
              aria-label="Send message"
              disabled={!value.trim() || disabled}
              onClick={handleSend}
              className="builder-send-btn"
              style={{ width: 30, height: 30 }}
              data-testid="pw-chat-send-btn"
            >
              <ArrowUp size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main chat panel ───────────────────────────────────────────────────────────
export function WorkspaceChatPanel({ messages = [], loading = false, onSend }) {
  // Per-message expand state keyed by message id
  const [expandedIds, setExpandedIds] = useState({});
  const scrollRef = useRef(null);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleChipClick = (label) => {
    onSend?.(label);
  };

  return (
    <section className="pw-chat-panel" aria-label="Chat history">
      {/* Scroll area */}
      <div
        className="pw-chat-scroll"
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {loading ? (
          <ChatSkeleton />
        ) : (
          messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="pw-user-bubble">{msg.content}</div>
                </div>
              );
            }

            if (msg.type === "task_summary") {
              return (
                <TaskSummaryCard
                  key={msg.id}
                  message={msg}
                  expanded={!!expandedIds[msg.id]}
                  onToggleExpand={() => toggleExpand(msg.id)}
                />
              );
            }

            return (
              <AiTextCard
                key={msg.id}
                message={msg}
                expanded={!!expandedIds[msg.id]}
                onToggleExpand={() => toggleExpand(msg.id)}
              />
            );
          })
        )}
      </div>

      {/* Quick chips */}
      {!loading && <QuickChips onChipClick={handleChipClick} />}

      {/* Input */}
      <ChatInput onSend={onSend} disabled={loading} />
    </section>
  );
}
