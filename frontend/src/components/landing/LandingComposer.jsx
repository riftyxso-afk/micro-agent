import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Paperclip,
  Wand2,
  ArrowUp,
  ChevronDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ModelPicker } from "@/components/workspace/ModelPicker";
import { ModelIcon } from "@/components/workspace/ModelIcon";
import { getModelById, DEFAULT_MODEL_ID, QUICK_CHIPS, AUTO_MODEL } from "@/lib/workspaceData";

export const LandingComposer = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const textareaRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(() => getModelById(DEFAULT_MODEL_ID));
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [activeChip, setActiveChip] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasContent = prompt.trim().length > 0;
  const activeChipData = QUICK_CHIPS.find((c) => c.id === activeChip);

  const autoresize = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 156)}px`;
  };

  useEffect(() => {
    if (textareaRef.current) autoresize(textareaRef.current);
  }, [prompt]);
  const placeholder = activeChipData
    ? activeChipData.hint
    : "Ask anything with MicroAgent";

  function handleSubmit() {
    const params = new URLSearchParams();
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length > 0) {
      params.set("prompt", cleanPrompt);
    }
    if (model && !isAutoMode) {
      params.set("modelId", model.id);
    }
    if (isAutoMode) {
      params.set("autoMode", "1");
    }
    if (activeChip) {
      params.set("chipId", activeChip);
    }
    const qs = params.toString();
    navigate(qs ? `/home?${qs}` : "/home");
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasContent) handleSubmit();
    }
  };

  const handleModelSelect = (m, isAuto) => {
    if (isAuto) {
      setIsAutoMode(true);
    } else {
      setIsAutoMode(false);
      setModel(m);
    }
  };

  const handleChipClick = (chip) => {
    setActiveChip((prev) => (prev === chip.id ? null : chip.id));
  };

  return (
    <div className="w-full">
      {/* Composer card */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.25 }}
        data-testid="landing-composer"
        className="ma-composer-glow mx-auto w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_20px_80px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] duration-200 ease-out sm:rounded-[32px] sm:p-4 md:p-5"
      >
        <textarea
          ref={textareaRef}
          data-testid="landing-composer-textarea"
          rows={1}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            autoresize(e.target);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Ask anything with MicroAgent"
          className="block min-h-[44px] w-full resize-none border-0 bg-transparent p-1 text-left text-[15px] leading-5 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0 sm:min-h-[52px] sm:text-[16px] md:text-[17px]"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
          {/* Left icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="landing-attach-button"
              aria-label="Attach files"
              onClick={() =>
                toast("File upload lives in the workspace", {
                  description: "Start a chat to upload PDFs, notes, and docs.",
                })
              }
              className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors duration-150 ease-out hover:bg-[#F3F4F6] hover:text-[#111111] active:scale-[0.95]"
            >
              <Paperclip size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="model-selector-trigger"
              aria-label={
                isAutoMode ? "Auto Select Model" : `Active model: ${model.name}`
              }
              onClick={() => setPickerOpen(true)}
              className="ma-focus flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.98]"
            >
              {isAutoMode ? (
                <>
                  <ModelIcon model={AUTO_MODEL} size={22} />
                  <span data-testid="model-selector-label">Auto Select Model</span>
                </>
              ) : (
                <>
                  <ModelIcon model={model} size={22} />
                  <span data-testid="model-selector-label" className="hidden sm:inline">
                    {model.name}
                  </span>
                  <span className="sm:hidden">{model.shortName}</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#B45309]">
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

            <button
              type="button"
              data-testid="auto-mode-toggle"
              aria-label="Auto Mode"
              aria-pressed={isAutoMode}
              onClick={() => setIsAutoMode((a) => !a)}
              className={`ma-focus flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                isAutoMode
                  ? "ma-auto-active text-[#4338CA]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
              }`}
            >
              <Wand2 size={16} strokeWidth={1.75} />
              Auto
            </button>

            <button
              type="button"
              data-testid="landing-send-button"
              aria-label="Send prompt"
              disabled={!hasContent}
              onClick={handleSubmit}
              className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.94] ${
                hasContent
                  ? "bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_7px_22px_rgba(0,0,0,0.26)]"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-500"
              }`}
            >
              <ArrowUp size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick action chips */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.55 } },
        }}
        className="mx-auto mt-6 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2.5 sm:gap-3"
      >
        {QUICK_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const active = activeChip === chip.id;
          return (
            <motion.button
              key={chip.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
              }}
              type="button"
              data-testid={`quick-chip-${chip.id}`}
              aria-label={chip.label}
              aria-pressed={active}
              onClick={() => handleChipClick(chip)}
              className={`ma-focus ma-chip flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] sm:py-3 ${
                active
                  ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA] shadow-sm"
                  : "border-neutral-200 bg-white text-[#374151] shadow-sm hover:bg-[#FAFAFA] hover:text-[#111111] hover:shadow-md"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={1.75}
                className={active ? "text-[#6366F1]" : "text-[#9CA3AF]"}
              />
              {chip.label}
            </motion.button>
          );
        })}
      </motion.div>

      <ModelPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={model.id}
        autoMode={isAutoMode}
        onSelect={handleModelSelect}
      />
    </div>
  );
};
