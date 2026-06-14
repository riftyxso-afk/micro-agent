import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Paperclip,
  SlidersHorizontal,
  Image,
  Globe,
  Sparkles,
  ArrowUp,
  Square,
  ChevronDown,
  Zap,
  X,
  FileText,
  Check,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ModelIcon } from "@/components/workspace/ModelIcon";
import { MODELS } from "@/lib/workspaceData";
import { SlashCommandPalette } from "@/components/workspace/SlashCommandPalette";

const IconAction = ({ testId, label, icon: Icon, onClick, active = false }) => (
  <Tooltip delayDuration={200}>
    <TooltipTrigger asChild>
      <button
        type="button"
        data-testid={testId}
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={`ma-focus grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
          active
            ? "bg-[#EFF4FF] text-[#3B6EF6]"
            : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
        }`}
      >
        <Icon size={18} strokeWidth={1.75} />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

const improvePrompt = (text) => {
  const t = text.trim();
  if (!t || t.length < 3) return "";
  if (t.length < 30) {
    const lower = t.toLowerCase();
    if (lower.includes("build") || lower.includes("create") || lower.includes("make")) {
      return `${t}. Include a clear structure, modern best practices, and explain key implementation details.`;
    }
    if (lower.includes("explain") || lower.includes("what") || lower.includes("how")) {
      return `${t}. Provide a thorough explanation with real-world examples and common use cases.`;
    }
    if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
      return `${t}. Compare pros, cons, performance, and ideal use cases for each option.`;
    }
    return `${t}. Be detailed, structured, and include practical examples where relevant.`;
  }
  return `${t}\n\nPlease provide a detailed, well-structured response with practical examples and key considerations.`;
};

export const PromptComposer = ({
  placeholder,
  onSend,
  isGenerating = false,
  onStop,
  model,
  autoMode,
  onModelSelect,
  onAutoModeToggle,
  compact = false,
  initialValue = "",
  initialWebSearch = false,
  webSearchEnabled,
  onWebSearchToggle,
}) => {
  const [value, setValue] = useState(initialValue);
  const [localWebSearch, setLocalWebSearch] = useState(initialWebSearch);
  const [attachments, setAttachments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [improving, setImproving] = useState(false);
  const [slashVisible, setSlashVisible] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const webSearch = webSearchEnabled ?? localWebSearch;

  const toggleWebSearch = () => {
    if (onWebSearchToggle) {
      onWebSearchToggle();
    } else {
      setLocalWebSearch((w) => !w);
    }
  };

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setLocalWebSearch(initialWebSearch);
  }, [initialWebSearch]);

  useEffect(() => {
    if (initialValue && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
      el.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const autoresize = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
    }
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    if (!hasContent || isGenerating) return;
    const text = value.trim() || `Analyse ${attachments.join(", ")}`;
    onSend(text, attachments);
    setValue("");
    setAttachments([]);
    setSlashVisible(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && slashVisible) {
      e.preventDefault();
      setSlashVisible(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !slashVisible) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSlashSelect = (cmd) => {
    setSlashVisible(false);
    if (cmd.type === "transform") {
      const base = value.replace(/^\/\s*\S*\s*/, "").trim();
      const transformed = cmd.transform(base);
      setValue(transformed);
      if (textareaRef.current) {
        autoresize(textareaRef.current);
        textareaRef.current.focus();
      }
      toast(`Applied /${cmd.name}`, { description: cmd.desc });
    } else if (cmd.type === "action") {
      if (cmd.action === "enable_web_search" && !webSearch) {
        toggleWebSearch();
      }
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
      toast(`/${cmd.name}`, { description: cmd.desc });
    }
  };

  const handleImprovePrompt = () => {
    if (!value.trim()) {
      toast("Improve prompt", { description: "Type something first, then click to improve." });
      return;
    }
    setImproving(true);
    setTimeout(() => {
      const improved = improvePrompt(value);
      setValue(improved);
      if (textareaRef.current) {
        autoresize(textareaRef.current);
        textareaRef.current.focus();
      }
      setImproving(false);
      toast("Prompt improved", { description: "Your prompt has been enhanced for clarity." });
    }, 600);
  };

  const selectModel = (m) => {
    if (onModelSelect) {
      onModelSelect(m, false);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="relative mx-auto w-full">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-[13px] text-[#6B7280]">
          Claude Opus-4.8 is coming
        </p>
        <Link
          to="/introducing-opus"
          data-testid="prompt-composer-learn-more"
          className="text-[13px] font-medium text-[#111111] transition-colors hover:text-[#3B6EF6]"
        >
          Learn more
        </Link>
      </div>

      <div
        data-testid="prompt-composer"
        className={`ma-composer relative mx-auto w-full rounded-[28px] border border-[#E5E7EB] bg-white transition-shadow duration-200 ease-out ${
          compact ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
        }`}
      >
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2" data-testid="attachment-list">
          {attachments.map((name, idx) => (
            <span
              key={`${name}-${idx}`}
              className="ma-fade-in inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F7F7F8] py-1 pl-2.5 pr-1.5 text-xs text-[#374151]"
            >
              <FileText size={13} strokeWidth={1.75} className="text-[#6B7280]" />
              <span className="max-w-[160px] truncate">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                data-testid={`attachment-remove-${idx}`}
                onClick={() => removeAttachment(idx)}
                className="ma-focus grid place-items-center rounded-full p-0.5 text-[#9CA3AF] transition-colors hover:bg-[#E5E7EB] hover:text-[#111111]"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        data-testid="prompt-composer-textarea"
        rows={1}
        value={value}
        placeholder={placeholder || "Ask anything"}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          autoresize(e.target);
          if (next.startsWith("/")) {
            setSlashVisible(true);
          } else {
            setSlashVisible(false);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-label="Ask anything"
        className={`block w-full resize-none border-0 bg-transparent p-1 text-[16px] leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0 ${
          compact ? "min-h-[40px]" : "min-h-[52px]"
        }`}
      />

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
            data-testid="prompt-composer-file-input"
          />
          <IconAction
            testId="prompt-composer-attach-button"
            label="Attach files"
            icon={Paperclip}
            onClick={() => fileInputRef.current?.click()}
          />
          <IconAction
            testId="prompt-composer-tools-button"
            label="Tools"
            icon={SlidersHorizontal}
            onClick={() =>
              toast("Tools", {
                description: "Connect tools and workflows — coming soon.",
              })
            }
          />
          <IconAction
            testId="prompt-composer-image-button"
            label="Add image"
            icon={Image}
            onClick={() => fileInputRef.current?.click()}
          />
          <IconAction
            testId="prompt-composer-web-button"
            label={webSearch ? "Web search on" : "Search the web"}
            icon={Globe}
            active={webSearch}
            onClick={toggleWebSearch}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              data-testid="model-selector-trigger"
              aria-label={`Active model: ${model.name}`}
              onClick={() => setDropdownOpen((d) => !d)}
              className="ma-focus flex h-9 max-w-[160px] items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.98] sm:max-w-none"
            >
              <ModelIcon model={model} size={20} />
              <span data-testid="model-selector-label" className="hidden truncate sm:inline">
                {model.name}
              </span>
              <span className="truncate sm:hidden">{model.shortName}</span>
              <span
                data-testid="model-credit-badge"
                className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#B45309]"
              >
                <Zap
                  size={11}
                  strokeWidth={2.25}
                  className="fill-[#F59E0B] text-[#F59E0B]"
                />
                {model.credits}
              </span>
              <ChevronDown size={14} strokeWidth={2} className={`text-[#9CA3AF] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

              {dropdownOpen && (
              <div
                data-testid="model-dropdown"
                className="ma-fade-in absolute bottom-full right-0 z-50 mb-2 w-[280px] rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
              >
                {MODELS.map((m) => {
                  const isSelected = !autoMode && model.id === m.id;
                  if (m.locked) {
                    return (
                      <Link
                        key={m.id}
                        to={m.lockedHref || "/introducing-opus"}
                        data-testid={`model-dropdown-${m.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#FAFAFA] opacity-60"
                      >
                        <ModelIcon model={m} size={26} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-[#111111]">{m.name}</span>
                            <Lock size={11} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
                          </span>
                          <span className="truncate text-[11px] text-[#9CA3AF]">{m.tag}</span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">
                          Soon
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-testid={`model-dropdown-${m.id}`}
                      onClick={() => selectModel(m)}
                      className={`ma-focus flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#F7F7F8]"
                          : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <ModelIcon model={m} size={26} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-[#111111]">{m.name}</span>
                          {isSelected && <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#111111]" />}
                        </span>
                        <span className="truncate text-[11px] text-[#9CA3AF]">{m.tag}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-semibold text-[#B45309]">
                        <Zap size={9} strokeWidth={2.25} className="fill-[#F59E0B] text-[#F59E0B]" />
                        {m.credits}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="improve-prompt-button"
                aria-label="Improve prompt with AI"
                onClick={handleImprovePrompt}
                disabled={improving}
                className={`ma-focus flex h-9 items-center gap-1.5 rounded-xl px-2 text-[13px] font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                  improving
                    ? "animate-pulse bg-[#F5F3FF] text-[#7C3AED]"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
                }`}
              >
                <Sparkles size={16} strokeWidth={1.75} />
                {improving ? (
                  <span className="ma-fade-in hidden text-xs xs:inline">Improving...</span>
                ) : (
                  <span className="hidden text-xs sm:inline">Improve</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Improve prompt with AI
            </TooltipContent>
          </Tooltip>

          {isGenerating ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-testid="stop-generation-button"
                  aria-label="Stop generating"
                  onClick={onStop}
                  className="ma-focus grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-white shadow-[0_4px_12px_rgba(17,24,39,0.25)] transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:bg-[#2D2D2D] active:scale-[0.94]"
                >
                  <Square size={13} strokeWidth={2.5} className="fill-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Stop generating
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              data-testid="prompt-composer-send-button"
              aria-label="Send message"
              disabled={!hasContent}
              onClick={handleSend}
              className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.92] ${
                hasContent
                  ? "bg-[#111111] text-white shadow-[0_4px_12px_rgba(17,24,39,0.25)] hover:bg-[#2D2D2D]"
                  : "cursor-default bg-[#E5E7EB] text-[#9CA3AF]"
              }`}
            >
              <ArrowUp size={18} strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>

      <SlashCommandPalette
        query={value}
        visible={slashVisible}
        onSelect={handleSlashSelect}
      />
    </div>
    </div>
  );
};
