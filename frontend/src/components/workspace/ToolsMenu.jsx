import { useState, useRef, useEffect, useCallback } from "react";
import { Settings2, Globe, Brain, Telescope, Zap, Check, Power, Sparkles, GraduationCap, Users, ChevronRight, X } from "lucide-react";
import { SkillPicker } from "@/components/workspace/SkillPicker";

const SEARCH_MODES = [
  { id: "off",      label: "Off",      Icon: Power,        description: "LLM knowledge only", webSearch: false },
  { id: "web",      label: "Web",      Icon: Globe,        description: "Search the web", webSearch: true },
  { id: "expert",   label: "Expert",   Icon: Sparkles,     description: "In-depth analysis", webSearch: false, badge: "NEW" },
  { id: "academic", label: "Academic", Icon: GraduationCap,description: "Research papers", webSearch: true },
  { id: "social",   label: "Social",   Icon: Users,        description: "Community opinions", webSearch: true },
];

const PANELS = {
  search: "search",
  ai:     "ai",
  skills: "skills",
};

/**
 * ToolsMenu
 * Single icon that opens a compact menu with three sections:
 *  Search Mode | AI Mode | Skills
 * Clicking a section header expands a sub-panel to the right.
 *
 * Props:
 *  searchMode, onSearchModeChange
 *  deepResearchMode, onDeepResearchToggle
 *  deepResearchMode, onDeepResearchToggle
 *  activeSkill, onSkillSelect, onSkillClear
 */
export const ToolsMenu = ({
  searchMode = "off",
  onSearchModeChange,
  reasoningEnabled = true,
  deepResearchMode = false,
  onDeepResearchToggle,
  activeSkill = null,
  onSkillSelect,
  onSkillClear,
}) => {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null); // 'search' | 'ai' | 'skills'
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const togglePanel = (p) => setPanel((prev) => (prev === p ? null : p));

  const currentMode = SEARCH_MODES.find((m) => m.id === searchMode) || SEARCH_MODES[0];
  const hasActive = searchMode !== "off" || reasoningEnabled || deepResearchMode || !!activeSkill;

  return (
    <div className="relative" ref={ref}>
      {/* Main dropup menu */}
      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 flex"
          style={{ animation: "slideUpFade 0.15s ease-out" }}
        >
          {/* Main menu */}
          <div className="w-52 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(17,24,39,0.12)]">
            <div className="border-b border-[#F3F4F6] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Tools</p>
            </div>

            {/* Search Mode row */}
            <button
              type="button"
              onClick={() => togglePanel(PANELS.search)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F7F7F8] ${
                panel === PANELS.search ? "bg-[#F7F7F8]" : ""
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                searchMode !== "off" ? "bg-[#3B6EF6] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}>
                <Globe size={14} strokeWidth={1.75} />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-[#111111]">Search Mode</span>
                <span className={`block text-[11px] ${
                  searchMode !== "off" ? "text-[#3B6EF6]" : "text-[#9CA3AF]"
                }`}>{currentMode.label}</span>
              </span>
              <ChevronRight size={13} strokeWidth={1.75} className={`text-[#D1D5DB] transition-transform ${
                panel === PANELS.search ? "rotate-90" : ""
              }`} />
            </button>

            {/* AI Mode row */}
            <button
              type="button"
              onClick={() => togglePanel(PANELS.ai)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F7F7F8] ${
                panel === PANELS.ai ? "bg-[#F7F7F8]" : ""
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                deepResearchMode ? "bg-[#C2410C] text-white" : reasoningEnabled ? "bg-[#3B6EF6] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}>
                {deepResearchMode ? <Telescope size={14} strokeWidth={1.75} /> : <Brain size={14} strokeWidth={1.75} />}
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-[#111111]">AI Mode</span>
                <span className={`block text-[11px] ${
                  deepResearchMode ? "text-[#C2410C]" : reasoningEnabled ? "text-[#3B6EF6]" : "text-[#9CA3AF]"
                }`}>
                  {deepResearchMode ? "Deep Research" : reasoningEnabled ? "Reasoning on" : "Standard"}
                </span>
              </span>
              <ChevronRight size={13} strokeWidth={1.75} className={`text-[#D1D5DB] transition-transform ${
                panel === PANELS.ai ? "rotate-90" : ""
              }`} />
            </button>

            {/* Skills row */}
            <button
              type="button"
              onClick={() => togglePanel(PANELS.skills)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F7F7F8] ${
                panel === PANELS.skills ? "bg-[#F7F7F8]" : ""
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                activeSkill ? "bg-[#4338CA] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}>
                {activeSkill ? <span className="text-[13px]">{activeSkill.icon}</span> : <Zap size={14} strokeWidth={1.75} />}
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-[#111111]">Skills</span>
                <span className={`block text-[11px] ${
                  activeSkill ? "text-[#4338CA]" : "text-[#9CA3AF]"
                }`}>{activeSkill ? activeSkill.name : "None"}</span>
              </span>
              <ChevronRight size={13} strokeWidth={1.75} className={`text-[#D1D5DB] transition-transform ${
                panel === PANELS.skills ? "rotate-90" : ""
              }`} />
            </button>
          </div>

          {/* Sub-panel (slides out to the right) */}
          {panel && (
            <div
              className="ml-2 max-h-[70vh] w-[min(220px,calc(100vw-280px))] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
              style={{ animation: "slideUpFade 0.12s ease-out" }}
            >
              {/* Search Mode panel */}
              {panel === PANELS.search && (
                <>
                  <div className="border-b border-[#F3F4F6] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Search Mode</p>
                  </div>
                  <div className="py-1">
                    {SEARCH_MODES.map((mode) => {
                      const MIcon = mode.Icon;
                      const isActive = searchMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => { onSearchModeChange?.(mode); }}
                          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                            isActive ? "bg-[#EFF4FF]" : "hover:bg-[#F7F7F8]"
                          }`}
                        >
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                            isActive ? "bg-[#3B6EF6] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                          }`}>
                            <MIcon size={12} strokeWidth={1.75} />
                          </span>
                          <span className="flex-1">
                            <span className={`flex items-center gap-1 text-[13px] font-medium ${
                              isActive ? "text-[#3B6EF6]" : "text-[#111111]"
                            }`}>
                              {mode.label}
                              {mode.badge && (
                                <span className="rounded-full bg-[#EFF4FF] px-1.5 text-[9px] font-semibold text-[#3B6EF6]">{mode.badge}</span>
                              )}
                            </span>
                            <span className="block text-[10px] text-[#9CA3AF]">{mode.description}</span>
                          </span>
                          {isActive && <Check size={12} strokeWidth={2.5} className="shrink-0 text-[#3B6EF6]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* AI Mode panel */}
              {panel === PANELS.ai && (
                <>
                  <div className="border-b border-[#F3F4F6] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">AI Mode</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={onDeepResearchToggle}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        deepResearchMode ? "bg-[#FFF7ED]" : "hover:bg-[#F7F7F8]"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                        deepResearchMode ? "bg-[#C2410C] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        <Telescope size={12} strokeWidth={1.75} />
                      </span>
                      <span className="flex-1">
                        <span className={`block text-[13px] font-medium ${
                          deepResearchMode ? "text-[#C2410C]" : "text-[#111111]"
                        }`}>Deep Research</span>
                        <span className="block text-[10px] text-[#9CA3AF]">Riset mendalam multi-sumber</span>
                      </span>
                      {deepResearchMode && <Check size={12} strokeWidth={2.5} className="shrink-0 text-[#C2410C]" />}
                    </button>
                  </div>
                </>
              )}

              {/* Skills panel */}
              {panel === PANELS.skills && (
                <SkillPanelInline
                  activeSkill={activeSkill}
                  onSelect={(skill) => { onSkillSelect?.(skill); }}
                  onClear={() => { onSkillClear?.(); }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        data-testid="tools-menu-button"
        aria-label="Tools"
        onClick={() => { setOpen((o) => !o); if (!open) setPanel(null); }}
        className={`ma-focus relative grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
          hasActive
            ? "bg-[#EFF4FF] text-[#3B6EF6]"
            : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
        }`}
      >
        <Settings2 size={18} strokeWidth={1.75} />
        {hasActive && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#3B6EF6] ring-2 ring-white" />
        )}
      </button>
    </div>
  );
};

// Inline skill list (no separate open/close state)
const API_BASE = process.env.REACT_APP_API_URL || "";

const SkillPanelInline = ({ activeSkill, onSelect, onClear }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/skills`)
      .then((r) => r.json())
      .then((d) => setSkills(d.skills || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = skills.filter(
    (s) => !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="border-b border-[#F3F4F6] px-3 py-2">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Skills</p>
        <input
          autoFocus
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-1 px-2 text-[12px] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/20"
        />
      </div>
      {loading ? (
        <div className="px-3 py-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="ma-shimmer h-7 w-7 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="ma-shimmer h-2.5 w-20 rounded-full" />
                <div className="ma-shimmer h-2 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-1">
          {filtered.map((skill) => {
            const isActive = activeSkill?.slug === skill.slug;
            return (
              <button
                key={skill.slug}
                type="button"
                onClick={() => isActive ? onClear?.() : onSelect?.(skill)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  isActive ? "bg-[#EEF2FF]" : "hover:bg-[#F7F7F8]"
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[14px]">
                  {skill.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[12px] font-medium ${
                    isActive ? "text-[#4338CA]" : "text-[#111111]"
                  }`}>{skill.name}</span>
                  <span className="block truncate text-[10px] text-[#9CA3AF]">{skill.description}</span>
                </span>
                {isActive && <Check size={11} strokeWidth={2.5} className="shrink-0 text-[#4338CA]" />}
              </button>
            );
          })}
          {activeSkill && (
            <div className="border-t border-[#F3F4F6] p-1.5">
              <button
                type="button"
                onClick={onClear}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              >
                <X size={10} strokeWidth={2} /> Hapus skill
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
