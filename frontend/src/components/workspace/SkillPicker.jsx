import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Search, X, Check, ChevronRight } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "";

const CATEGORY_LABELS = {
  writing:  "Writing",
  coding:   "Coding",
  analysis: "Analysis",
  general:  "General",
};

/**
 * SkillPicker
 * Dropup that lists available skills grouped by category.
 * Props:
 *  activeSkill   - { slug, name, icon } | null
 *  onSelect      - (skill) => void
 *  onClear       - () => void
 */
export const SkillPicker = ({ activeSkill, onSelect, onClear }) => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Load skills when first opened
  useEffect(() => {
    if (!open || skills.length > 0) return;
    setLoading(true);
    fetch(`${API_BASE}/api/skills`)
      .then((r) => r.json())
      .then((d) => setSkills(d.skills || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, skills.length]);

  const filtered = skills.filter(
    (s) =>
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.slug.includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce((acc, s) => {
    const cat = s.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const handleSelect = useCallback((skill) => {
    onSelect?.(skill);
    setOpen(false);
    setQuery("");
  }, [onSelect]);

  const hasActive = !!activeSkill;

  return (
    <div className="relative" ref={ref}>
      {/* Dropup menu */}
      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 max-h-[70vh] w-[min(280px,calc(100vw-16px))] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
          style={{ animation: "slideUpFade 0.15s ease-out" }}
        >
          {/* Header */}
          <div className="border-b border-[#F3F4F6] px-3 py-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Skills</p>
            <div className="relative">
              <Search size={12} strokeWidth={1.75} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                autoFocus
                type="text"
                placeholder="Search skills..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-1.5 pl-7 pr-2 text-[12px] text-[#111111] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/20"
              />
            </div>
          </div>

          {/* Skills list */}
          {loading ? (
            <div className="px-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-0.5 py-2">
                  <div className="ma-shimmer h-8 w-8 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="ma-shimmer h-3 w-24 rounded-full" />
                    <div className="ma-shimmer h-2.5 w-36 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-[#9CA3AF]">
              {query ? "No skills match" : "No skills available"}
            </div>
          ) : (
            <div className="py-1">
              {Object.entries(grouped).map(([cat, catSkills]) => (
                <div key={cat}>
                  <div className="px-3 pb-0.5 pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {CATEGORY_LABELS[cat] || cat}
                    </p>
                  </div>
                  {catSkills.map((skill) => {
                    const isActive = activeSkill?.slug === skill.slug;
                    return (
                      <button
                        key={skill.slug}
                        type="button"
                        onClick={() => handleSelect(skill)}
                        className={`ma-focus flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                          isActive ? "bg-[#EEF2FF]" : "hover:bg-[#F7F7F8]"
                        }`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#F3F4F6] text-[18px]">
                          {skill.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13px] font-medium ${
                            isActive ? "text-[#4338CA]" : "text-[#111111]"
                          }`}>{skill.name}</span>
                          <span className="block truncate text-[11px] text-[#9CA3AF]">{skill.description}</span>
                        </span>
                        {isActive && <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#4338CA]" />}
                        {!isActive && <ChevronRight size={13} strokeWidth={1.75} className="shrink-0 text-[#D1D5DB]" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Clear active skill */}
          {hasActive && (
            <div className="border-t border-[#F3F4F6] p-2">
              <button
                type="button"
                onClick={() => { onClear?.(); setOpen(false); }}
                className="ma-focus flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              >
                <X size={12} strokeWidth={2} />
                Hapus skill aktif
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        data-testid="skill-picker-button"
        aria-label={hasActive ? `Skill: ${activeSkill.name}` : "Skills"}
        aria-pressed={hasActive}
        onClick={() => setOpen((o) => !o)}
        className={`ma-focus relative grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
          hasActive
            ? "bg-[#EEF2FF] text-[#4338CA]"
            : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
        }`}
      >
        <Zap size={18} strokeWidth={1.75} />
        {hasActive && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#4338CA] ring-2 ring-white" />
        )}
      </button>
    </div>
  );
};
