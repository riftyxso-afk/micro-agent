import { useRef, useState } from "react";
import {
  Paperclip,
  SlidersHorizontal,
  Image,
  Globe,
  Wand2,
  ArrowUp,
  Square,
  ChevronDown,
  Zap,
  X,
  FileText,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ModelPicker } from "@/components/workspace/ModelPicker";

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
}) => {
  const [value, setValue] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasContent = value.trim().length > 0 || attachments.length > 0;

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
      className={`ma-composer mx-auto w-full rounded-[28px] border border-[#E5E7EB] bg-white transition-shadow duration-200 ease-out ${
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
          setValue(e.target.value);
          autoresize(e.target);
        }}
        onKeyDown={handleKeyDown}
        aria-label="Ask anything"
        className={`block w-full resize-none border-0 bg-transparent p-1 text-[16px] leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0 ${
          compact ? "min-h-[40px]" : "min-h-[52px]"
        }`}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
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
            onClick={() => setWebSearch((w) => !w)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="model-selector-trigger"
            aria-label={
              autoMode ? "Auto Select Model" : `Active model: ${model.name}`
            }
            onClick={() => setPickerOpen(true)}
            className="ma-focus flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.98]"
          >
            {autoMode ? (
              <>
                <span className="ma-logo-mark grid h-4.5 w-4.5 place-items-center rounded-md p-0.5">
                  <Wand2 size={11} strokeWidth={2.25} className="text-white" />
                </span>
                <span data-testid="model-selector-label">Auto Select Model</span>
              </>
            ) : (
              <>
                <ModelDot color={model.color} />
                <span data-testid="model-selector-label" className="hidden sm:inline">
                  {model.name}
                </span>
                <span className="sm:hidden">{model.shortName}</span>
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
              </>
            )}
            <ChevronDown size={14} strokeWidth={2} className="text-[#9CA3AF]" />
          </button>

          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="auto-mode-toggle"
                aria-label="Auto Mode"
                aria-pressed={autoMode}
                onClick={onAutoModeToggle}
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

          {isGenerating ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-testid="stop-generation-button"
                  aria-label="Stop generating"
                  onClick={onStop}
                  className="ma-focus grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-white shadow-[0_4px_12px_rgba(17,24,39,0.25)] transition-all duration-200 ease-out hover:bg-[#2D2D2D] active:scale-[0.94]"
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
              className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-all duration-200 ease-out active:scale-[0.94] ${
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

      <ModelPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={model.id}
        autoMode={autoMode}
        onSelect={onModelSelect}
      />
    </div>
  );
};
