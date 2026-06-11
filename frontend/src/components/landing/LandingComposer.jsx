import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Paperclip,
  Globe,
  Wand2,
  ArrowUp,
  ChevronDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { ModelPicker } from "@/components/workspace/ModelPicker";
import { getModelById, DEFAULT_MODEL_ID, QUICK_CHIPS } from "@/lib/workspaceData";

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

export const LandingComposer = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(() => getModelById(DEFAULT_MODEL_ID));
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [activeChip, setActiveChip] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasContent = prompt.trim().length > 0;
  const activeChipData = QUICK_CHIPS.find((c) => c.id === activeChip);
  const placeholder = activeChipData
    ? activeChipData.hint
    : "Ask anything with MicroAgent";

  function handleSubmit() {
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length > 0) {
      navigate(`/home?prompt=${encodeURIComponent(cleanPrompt)}`);
    } else {
      navigate("/home");
    }
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
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.25 }}
        data-testid="landing-composer"
        className="ma-composer-glow mx-auto w-full max-w-3xl rounded-[32px] border border-neutral-200 bg-white p-4 shadow-[0_20px_80px_rgba(0,0,0,0.08)] md:p-5"
      >
        <textarea
          data-testid="landing-composer-textarea"
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Ask anything with MicroAgent"
          className="block min-h-[56px] w-full resize-none border-0 bg-transparent p-1.5 text-left text-[16px] leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0 md:text-[17px]"
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
            <button
              type="button"
              data-testid="landing-web-button"
              aria-label={webSearch ? "Web search on" : "Search the web"}
              aria-pressed={webSearch}
              onClick={() => setWebSearch((w) => !w)}
              className={`ma-focus grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
                webSearch
                  ? "bg-[#EFF4FF] text-[#3B6EF6]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
              }`}
            >
              <Globe size={18} strokeWidth={1.75} />
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
                  <span className="ma-logo-mark grid h-[18px] w-[18px] place-items-center rounded-md">
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
              className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-all duration-200 ease-out active:scale-[0.94] ${
                hasContent
                  ? "bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-105"
                  : "cursor-default bg-neutral-200 text-neutral-500"
              }`}
            >
              <ArrowUp size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick action chips */}
      <motion.div
        initial="hidden"
        animate="show"
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
