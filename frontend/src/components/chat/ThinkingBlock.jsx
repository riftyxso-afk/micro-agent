import { ChevronDown, Check } from "lucide-react";
import { THINKING_STEPS } from "@/lib/workspaceData";

export const ThinkingBlock = ({ state, open, onToggle, steps }) => {
  const items = steps || THINKING_STEPS;
  const isWorking = state === "thinking" || state === "pending";
  // While thinking, highlight steps progressively; streaming/completed = all done
  const activeIndex = isWorking ? Math.min(items.length - 1, 1) : items.length;

  return (
    <div className="mb-3">
      <button
        type="button"
        data-testid="thinking-toggle"
        aria-expanded={open}
        onClick={onToggle}
        className="ma-focus group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-medium text-[#6B7280] transition-colors duration-150 ease-out hover:text-[#111111]"
      >
        <span className="ma-thinking-label inline-flex items-center gap-1.5">
          {isWorking && <span className="ma-shimmer-text">Thinking</span>}
          {!isWorking && "Thinking"}
          {isWorking && (
            <span className="ma-typing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`transition-transform duration-200 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`ma-collapse ${open ? "ma-collapse-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <ul
            data-testid="thinking-content"
            className="ml-2.5 mt-1.5 space-y-2 border-l-2 border-[#E5E7EB] pl-4 pt-0.5"
          >
            {items.map((step, i) => {
              const done = i < activeIndex;
              const active = isWorking && i === activeIndex;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-2 text-[13px] leading-relaxed ${
                    active
                      ? "text-[#374151]"
                      : done
                        ? "text-[#6B7280]"
                        : "text-[#9CA3AF]"
                  }`}
                >
                  {done ? (
                    <Check
                      size={13}
                      strokeWidth={2.25}
                      className="shrink-0 text-[#9CA3AF]"
                    />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? "ma-pulse-dot bg-[#A5B4FC]" : "bg-[#D1D5DB]"
                      }`}
                    />
                  )}
                  {step}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
