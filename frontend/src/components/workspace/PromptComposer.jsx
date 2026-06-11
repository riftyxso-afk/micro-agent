import { useRef, useState } from "react";
import {
  Paperclip,
  SlidersHorizontal,
  Image,
  Globe,
  Wand2,
  ArrowUp,
  ChevronDown,
  Check,
  Zap,
  X,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { MODELS } from "@/lib/workspaceData";

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

const ModelDot = ({ color, size = 10 }) => (
  <span
    aria-hidden="true"
    className="inline-block shrink-0 rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      boxShadow: `0 0 0 3px ${color}1f`,
    }}
  />
);

export const PromptComposer = ({ placeholder }) => {
  const [value, setValue] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [autoMode, setAutoMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  const autoresize = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  };

  const handleSelectModel = (m) => {
    setModel(m);
    if (autoMode) setAutoMode(false);
    toast(`Model set to ${m.name}`, {
      description: `${m.tag} · ${m.credits} credits per message`,
    });
  };

  const handleAutoMode = () => {
    const next = !autoMode;
    setAutoMode(next);
    toast(next ? "Auto Mode on" : "Auto Mode off", {
      description: next
        ? "MicroAgent picks the best model for every prompt"
        : `Back to ${model.name}`,
    });
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
    if (!hasContent) return;
    toast.success(
      autoMode ? "Sent — Auto Mode is choosing a model" : `Sent to ${model.name}`,
      { description: "This is a design preview — no AI backend connected yet." },
    );
    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      data-testid="prompt-composer"
      className="ma-composer mx-auto w-full rounded-[28px] border border-[#E5E7EB] bg-white p-4 transition-shadow duration-200 ease-out sm:p-5"
    >
      {/* Attachment pills */}
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
                className="ma-focus grid h-4.5 w-4.5 place-items-center rounded-full p-0.5 text-[#9CA3AF] transition-colors hover:bg-[#E5E7EB] hover:text-[#111111]"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input row */}
      <textarea
        ref={textareaRef}
        data-testid="prompt-composer-textarea"
        rows={1}
        value={value}
        placeholder={placeholder || "Ask anything"}
        onChange={(e) => {
          setValue(e.target.value);
          autoresize(e.target);
        }}
        onKeyDown={handleKeyDown}
        aria-label="Ask anything"
        className="block min-h-[52px] w-full resize-none border-0 bg-transparent p-1 text-[16px] leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0"
      />

      {/* Toolbar row */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
        {/* Left icon cluster */}
        <div className="flex items-center gap-1">
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
            onClick={() => toast("Tools", { description: "Connect tools and workflows — coming soon." })}
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
            onClick={() => setWebSearch((w) => !w)}
          />
        </div>

        {/* Right cluster: model selector / auto mode / send */}
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-testid="model-selector-trigger"
                aria-label={`Active model: ${model.name}`}
                className="ma-focus flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.98]"
              >
                <ModelDot color={model.color} />
                <span className="hidden sm:inline">{model.name}</span>
                <span className="sm:hidden">{model.name.split(" ")[0]}</span>
                <span
                  data-testid="model-credit-badge"
                  className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#B45309]"
                >
                  <Zap size={11} strokeWidth={2.25} className="fill-[#F59E0B] text-[#F59E0B]" />
                  {model.credits}
                </span>
                <ChevronDown size={14} strokeWidth={2} className="text-[#9CA3AF]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-64 rounded-2xl border-[#E5E7EB] p-1.5 shadow-[0_10px_30px_rgba(17,24,39,0.08)]"
            >
              <DropdownMenuLabel className="px-2.5 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                Choose a model
              </DropdownMenuLabel>
              {MODELS.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  data-testid={`model-selector-item-${m.id}`}
                  onClick={() => handleSelectModel(m)}
                  className="cursor-pointer rounded-xl px-2.5 py-2.5"
                >
                  <ModelDot color={m.color} size={9} />
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-[#111111]">{m.name}</span>
                    <span className="text-xs text-[#6B7280]">{m.tag}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                    <Zap size={10} strokeWidth={2.25} />
                    {m.credits}
                  </span>
                  {model.id === m.id && (
                    <Check size={15} strokeWidth={2.25} className="text-[#3B6EF6]" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-[#F0F1F3]" />
              <div className="px-2.5 py-2 text-xs text-[#9CA3AF]">
                Compare models side by side — coming soon
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto Mode */}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="auto-mode-toggle"
                aria-label="Auto Mode"
                aria-pressed={autoMode}
                onClick={handleAutoMode}
                className={`ma-focus flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                  autoMode
                    ? "ma-auto-active text-[#4338CA]"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
                }`}
              >
                <Wand2 size={17} strokeWidth={1.75} />
                {autoMode && <span className="ma-fade-in">Auto</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Auto Mode — picks the best model
            </TooltipContent>
          </Tooltip>

          {/* Send */}
          <button
            type="button"
            data-testid="prompt-composer-send-button"
            aria-label="Send message"
            disabled={!hasContent}
            onClick={handleSend}
            className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-all duration-200 ease-out active:scale-[0.94] ${
              hasContent
                ? "bg-[#111111] text-white shadow-[0_4px_12px_rgba(17,24,39,0.25)] hover:bg-[#2D2D2D]"
                : "cursor-default bg-[#E5E7EB] text-[#9CA3AF]"
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
};
