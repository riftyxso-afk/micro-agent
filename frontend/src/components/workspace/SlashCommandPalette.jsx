import { useMemo } from "react";
import { SLASH_COMMANDS } from "@/lib/workspaceData";
import { Terminal } from "lucide-react";

export const SlashCommandPalette = ({ query, onSelect, visible }) => {
  const filtered = useMemo(() => {
    if (!visible) return [];
    const q = (query || "").replace(/^\/\s*/, "").toLowerCase().trim();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.label.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q),
    );
  }, [query, visible]);

  const categories = useMemo(() => {
    const grouped = {};
    filtered.forEach((cmd) => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    });
    return grouped;
  }, [filtered]);

  if (!visible || filtered.length === 0) return null;

  return (
    <div
      data-testid="slash-command-palette"
      className="ma-fade-in absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
    >
      <div className="flex items-center gap-2 border-b border-[#F0F1F3] px-4 py-2.5">
        <Terminal size={14} strokeWidth={1.75} className="text-[#6366F1]" />
        <span className="text-xs font-medium text-[#6B7280]">Slash commands</span>
        <span className="ml-auto rounded-full bg-[#F7F7F8] px-2 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">
          {filtered.length}
        </span>
      </div>
      <div className="max-h-[280px] overflow-y-auto p-1.5">
        {Object.entries(categories).map(([category, cmds]) => (
          <div key={category}>
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {category}
            </div>
            {cmds.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.name}
                  type="button"
                  data-testid={`slash-command-${cmd.name}`}
                  onClick={() => onSelect(cmd)}
                  className="ma-focus group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[#F7F7F8]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#F7F7F8] text-[#6366F1] transition-colors duration-150 group-hover:bg-[#EEF2FF]">
                    <Icon size={14} strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-[#111111]">
                      /{cmd.name}
                    </span>
                    <span className="truncate text-[11px] text-[#6B7280]">
                      {cmd.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-[#F0F1F3] px-4 py-2 text-[11px] text-[#9CA3AF]">
        <span>Click to select</span>
        <span className="text-[#D1D5DB]">·</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};
