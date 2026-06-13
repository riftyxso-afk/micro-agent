import { QUICK_CHIPS } from "@/lib/workspaceData";

export const QuickChips = ({ activeChip, onChipClick, compact = false }) => {
  return (
    <div
      data-testid="quick-chips"
      className="mx-auto flex w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3"
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
            onClick={() => onChipClick(chip)}
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
  );
};
