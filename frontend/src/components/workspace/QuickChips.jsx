import { useState } from "react";
import { QUICK_CHIPS, CHIP_RECOMMENDATIONS } from "@/lib/workspaceData";
import { MessageSquare, Sparkles } from "lucide-react";

export const QuickChips = ({ activeChip, onChipClick, onRecommendation, compact = false }) => {
  const [expandedChip, setExpandedChip] = useState(null);

  const handleChipClick = (chip) => {
    if (activeChip === chip.id && expandedChip === chip.id) {
      setExpandedChip(null);
    } else {
      setExpandedChip(chip.id);
    }
    onChipClick(chip);
  };

  const handleRecClick = (rec) => {
    if (onRecommendation) {
      onRecommendation(rec.text);
    }
    setExpandedChip(null);
  };

  return (
    <div className="mx-auto w-full">
      <div
        data-testid="quick-chips"
        className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3"
      >
        {QUICK_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const active = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              data-testid={`quick-chip-${chip.id}`}
              aria-label={chip.label}
              aria-pressed={active}
              onClick={() => handleChipClick(chip)}
              className={`ma-focus ma-chip flex items-center rounded-full border font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                compact
                  ? "h-8 gap-1.5 px-3 text-[12.5px]"
                  : "h-10 gap-2 px-4 text-sm"
              } ${
                active
                  ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA] shadow-[0_1px_2px_rgba(67,56,202,0.08)]"
                  : "border-[#E5E7EB] bg-white text-[#374151] shadow-[0_1px_2px_rgba(17,24,39,0.05)] hover:bg-[#FAFAFA] hover:text-[#111111]"
              }`}
            >
              <Icon
                size={compact ? 14 : 16}
                strokeWidth={1.75}
                className={active ? "text-[#6366F1]" : "text-[#9CA3AF]"}
              />
              {chip.label}
            </button>
          );
        })}
      </div>

      {expandedChip && CHIP_RECOMMENDATIONS[expandedChip] && (
        <div 
          className="ma-fade-in mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-3" 
          data-testid="chip-recommendations"
        >
          <div className="mb-2.5 flex items-center gap-2 px-2">
            <Sparkles size={14} strokeWidth={1.75} className="text-[#6366F1]" />
            <span className="text-xs font-medium text-[#6B7280]">
              {QUICK_CHIPS.find(c => c.id === expandedChip)?.label} suggestions
            </span>
          </div>
          <div className="space-y-1.5">
            {CHIP_RECOMMENDATIONS[expandedChip].map((rec) => (
              <button
                key={rec.id}
                type="button"
                data-testid={`chip-rec-${rec.id}`}
                onClick={() => handleRecClick(rec)}
                className="ma-focus group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ease-out hover:bg-[#F7F7F8]"
              >
                <MessageSquare size={14} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF] transition-colors duration-150 group-hover:text-[#6366F1]" />
                <span className="text-sm text-[#374151] transition-colors duration-150 group-hover:text-[#111111]">
                  {rec.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
