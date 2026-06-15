import { useState, useCallback } from "react";
import { HelpCircle, PenLine, ArrowRight } from "lucide-react";

/**
 * QnaCard
 * Renders a clarifying question with clickable option buttons.
 *
 * Props:
 *  preText     - optional text before the question
 *  question    - the clarifying question string
 *  options     - array of { id, label, description }
 *  allowCustom - bool: show "other" custom input
 *  onAnswer    - callback(answerText) when user picks an option or submits custom
 */
export const QnaCard = ({ preText, question, options = [], allowCustom = false, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleOption = useCallback((opt) => {
    if (selected) return;
    setSelected(opt.id);
    const answerText = opt.description
      ? `${opt.label}: ${opt.description}`
      : opt.label;
    onAnswer?.(answerText);
  }, [selected, onAnswer]);

  const handleCustomSubmit = useCallback(() => {
    const val = customValue.trim();
    if (!val || selected) return;
    setSelected("custom");
    onAnswer?.(val);
  }, [customValue, selected, onAnswer]);

  return (
    <div className="ma-pipeline-enter w-full max-w-[480px] overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.06)]">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-[#F3F4F6] px-4 py-3.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EFF4FF] text-[#3B6EF6]">
          <HelpCircle size={14} strokeWidth={2} />
        </span>
        <div>
          {preText && (
            <p className="mb-1.5 text-[13px] text-[#6B7280]">{preText}</p>
          )}
          <p className="text-[14px] font-semibold text-[#111111]">{question}</p>
        </div>
      </div>

      {/* Options */}
      <div className="px-3 py-2.5 space-y-1.5">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isDisabled = selected !== null;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleOption(opt)}
              className={`ma-focus flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150 ease-out ${
                isSelected
                  ? "border-[#3B6EF6] bg-[#EFF4FF]"
                  : isDisabled
                  ? "border-[#E5E7EB] bg-[#FAFAFA] opacity-50 cursor-not-allowed"
                  : "border-[#E5E7EB] bg-white hover:border-[#3B6EF6] hover:bg-[#EFF4FF] active:scale-[0.99]"
              }`}
            >
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold transition-colors ${
                  isSelected
                    ? "border-[#3B6EF6] bg-[#3B6EF6] text-white"
                    : "border-[#D1D5DB] text-[#9CA3AF]"
                }`}
              >
                {opt.id.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[13px] font-medium ${
                  isSelected ? "text-[#3B6EF6]" : "text-[#111111]"
                }`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="block text-[11px] text-[#9CA3AF] mt-0.5">
                    {opt.description}
                  </span>
                )}
              </span>
              {isSelected && (
                <ArrowRight size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#3B6EF6]" />
              )}
            </button>
          );
        })}

        {/* Custom input */}
        {allowCustom && !selected && (
          <div className="mt-1">
            {!showCustom ? (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="ma-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
              >
                <PenLine size={12} strokeWidth={1.75} />
                Jawaban lain...
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik jawaban kamu..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111111] outline-none focus:border-[#3B6EF6] focus:ring-2 focus:ring-[#3B6EF6]/10"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customValue.trim()}
                  className="ma-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B6EF6] text-white transition-colors disabled:opacity-40 hover:bg-[#2D5EE0]"
                >
                  <ArrowRight size={15} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
