import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Paperclip,
  SlidersHorizontal,
  Image,
  Globe,
  Brain,
  Sparkles,
  ArrowUp,
  Square,
  ChevronDown,
  Zap,
  X,
  FileText,
  Check,
  Lock,
  Power,
  GraduationCap,
  Users,
  Telescope,
} from "lucide-react";
import { SkillPicker } from "@/components/workspace/SkillPicker";
import { ToolsMenu } from "@/components/workspace/ToolsMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ModelIcon } from "@/components/workspace/ModelIcon";
import { MODELS } from "@/lib/workspaceData";
import { SlashCommandPalette } from "@/components/workspace/SlashCommandPalette";

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

const SEARCH_MODES = [
  {
    id: "off",
    label: "Off",
    Icon: Power,
    description: "Use LLM knowledge only",
    systemPrompt: "",
    webSearch: false,
  },
  {
    id: "web",
    label: "Web",
    Icon: Globe,
    description: "Search across the entire web",
    systemPrompt: "Cari informasi terkini dan akurat dari seluruh internet sebelum menjawab. Prioritaskan sumber terbaru. Sebutkan sumber secara natural dalam jawaban.",
    webSearch: true,
  },
  {
    id: "expert",
    label: "Expert",
    Icon: Sparkles,
    description: "In-depth, more detailed output",
    systemPrompt: "Berikan jawaban yang sangat mendalam, komprehensif, dan penuh detail teknis. Bahas dari semua sudut pandang, sertakan contoh nyata, edge case, dan pertimbangan nuansa. Berpikirlah seperti pakar di bidang ini.",
    badge: "NEW",
    webSearch: false,
  },
  {
    id: "academic",
    label: "Academic",
    Icon: GraduationCap,
    description: "Search within research papers",
    systemPrompt: "Fokus HANYA pada sumber akademik dan ilmiah: jurnal penelitian, paper, studi, dan karya ilmiah. Gunakan bahasa akademik formal. Sebutkan judul paper, nama peneliti, atau institusi jika relevan. Hindari sumber non-akademik seperti blog, berita, atau media sosial.",
    webSearch: true,
  },
  {
    id: "social",
    label: "Social",
    Icon: Users,
    description: "For discussions and opinions",
    systemPrompt: "Fokus pada opini nyata masyarakat, diskusi komunitas, pengalaman pengguna, dan konsensus sosial. Sertakan berbagai perspektif dari forum, media sosial, dan diskusi publik. Gambarkan apa yang orang-orang pikirkan dan rasakan tentang topik ini.",
    webSearch: true,
  },
];

const improvePrompt = (text) => {
  const t = text.trim();
  if (!t || t.length < 3) return "";
  if (t.length < 30) {
    const lower = t.toLowerCase();
    if (lower.includes("build") || lower.includes("create") || lower.includes("make")) {
      return `${t}. Include a clear structure, modern best practices, and explain key implementation details.`;
    }
    if (lower.includes("explain") || lower.includes("what") || lower.includes("how")) {
      return `${t}. Provide a thorough explanation with real-world examples and common use cases.`;
    }
    if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
      return `${t}. Compare pros, cons, performance, and ideal use cases for each option.`;
    }
    return `${t}. Be detailed, structured, and include practical examples where relevant.`;
  }
  return `${t}\n\nPlease provide a detailed, well-structured response with practical examples and key considerations.`;
};

export const PromptComposer = ({
  placeholder,
  onSend,
  onDeepResearch,
  onFileSelect,
  uploadedFilesCount = 0,
  isGenerating = false,
  onStop,
  model,
  autoMode,
  onModelSelect,
  onAutoModeToggle,
  compact = false,
  initialValue = "",
  initialWebSearch = false,
  webSearchEnabled,
  onWebSearchToggle,
  reasoningEnabled,
  onReasoningToggle,
}) => {
  const [value, setValue] = useState(initialValue);
  const [localWebSearch, setLocalWebSearch] = useState(initialWebSearch);
  const [attachments, setAttachments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null); // { slug, name, icon }
  const [improving, setImproving] = useState(false);
  const [slashVisible, setSlashVisible] = useState(false);
  const [searchMode, setSearchMode] = useState("off");
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [dropupOpen, setDropupOpen] = useState(false);
  const [modeDropupOpen, setModeDropupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const deepResearchModeDropup = [modeDropupOpen, setModeDropupOpen];
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropupRef = useRef(null);
  const modeDropupRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close mode dropup on outside click
  useEffect(() => {
    if (!modeDropupOpen) return;
    const handler = (e) => {
      if (modeDropupRef.current && !modeDropupRef.current.contains(e.target)) {
        setModeDropupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modeDropupOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  // Close dropup on outside click
  useEffect(() => {
    if (!dropupOpen) return;
    const handler = (e) => {
      if (dropupRef.current && !dropupRef.current.contains(e.target)) {
        setDropupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropupOpen]);

  const webSearch = webSearchEnabled ?? localWebSearch;

  const toggleWebSearch = () => {
    if (onWebSearchToggle) {
      onWebSearchToggle();
    } else {
      setLocalWebSearch((w) => !w);
    }
  };

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setLocalWebSearch(initialWebSearch);
  }, [initialWebSearch]);

  useEffect(() => {
    if (initialValue && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
      el.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const autoresize = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      if (onFileSelect) {
        // Route real File objects to parent for analysis
        onFileSelect(files);
      } else {
        setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
      }
    }
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    if (!hasContent || isGenerating) return;
    const text = value.trim() || `Analyse ${attachments.join(", ")}`;

    // Deep Research mode — route to research handler
    if (deepResearchMode && onDeepResearch) {
      onDeepResearch(text);
      setValue("");
      setAttachments([]);
      setSlashVisible(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
      return;
    }

    const activeMode = SEARCH_MODES.find((m) => m.id === searchMode);
    onSend(text, attachments, activeMode?.systemPrompt || "", searchMode, activeMode?.webSearch ?? false, activeSkill?.slug || null);
    setValue("");
    setAttachments([]);
    setSlashVisible(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && slashVisible) {
      e.preventDefault();
      setSlashVisible(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !slashVisible) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSlashSelect = (cmd) => {
    setSlashVisible(false);
    if (cmd.type === "transform") {
      const base = value.replace(/^\/\s*\S*\s*/, "").trim();
      const transformed = cmd.transform(base);
      setValue(transformed);
      if (textareaRef.current) {
        autoresize(textareaRef.current);
        textareaRef.current.focus();
      }
      toast(`Applied /${cmd.name}`, { description: cmd.desc });
    } else if (cmd.type === "action") {
      if (cmd.action === "enable_web_search" && !webSearch) {
        toggleWebSearch();
      }
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
      toast(`/${cmd.name}`, { description: cmd.desc });
    }
  };

  const [improvePreview, setImprovePreview] = useState(null); // { original, improved }
  const [editableImproved, setEditableImproved] = useState("");
  const improvePreviewRef = useRef(null);

  // Close improve preview on outside click
  useEffect(() => {
    if (!improvePreview) return;
    const handler = (e) => {
      if (improvePreviewRef.current && !improvePreviewRef.current.contains(e.target)) {
        setImprovePreview(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [improvePreview]);

  const API_BASE = process.env.REACT_APP_API_URL || "";

  const handleImprovePrompt = async () => {
    const text = value.trim();
    if (text.length < 3) {
      toast("Improve prompt", { description: "Type something first, then click to improve." });
      return;
    }
    setImproving(true);
    try {
      const res = await fetch(`${API_BASE}/api/improve-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal improve prompt");
      setImprovePreview({ original: data.original, improved: data.improved });
      setEditableImproved(data.improved);
    } catch (err) {
      // Fallback to local transform
      const improved = improvePrompt(text);
      setImprovePreview({ original: text, improved });
      setEditableImproved(improved);
    } finally {
      setImproving(false);
    }
  };

  const acceptImproved = () => {
    setValue(editableImproved);
    setImprovePreview(null);
    setTimeout(() => {
      if (textareaRef.current) {
        autoresize(textareaRef.current);
        textareaRef.current.focus();
      }
    }, 50);
  };

  const selectModel = (m) => {
    if (onModelSelect) {
      onModelSelect(m, false);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="relative mx-auto w-full">
      {/* Improve Prompt Preview — appears above composer */}
      {improvePreview && (
        <div
          ref={improvePreviewRef}
          className="ma-pipeline-enter absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_-4px_24px_rgba(17,24,39,0.12)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6366F1]">
              <Sparkles size={13} strokeWidth={2} />
              Improved Prompt
            </span>
            <button
              type="button"
              onClick={() => setImprovePreview(null)}
              className="ma-focus grid h-6 w-6 place-items-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111111]"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
          {/* Before */}
          <div className="border-b border-[#F3F4F6] px-4 py-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Sebelum</p>
            <p className="text-[13px] text-[#9CA3AF] line-through">{improvePreview.original}</p>
          </div>
          {/* After — editable */}
          <div className="px-4 py-2.5">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Sesudah</p>
            <textarea
              autoFocus
              rows={3}
              value={editableImproved}
              onChange={(e) => setEditableImproved(e.target.value)}
              className="w-full resize-none rounded-xl border border-[#6366F1]/30 bg-[#FAFAFA] px-3 py-2 text-[13px] leading-relaxed text-[#111111] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10"
            />
          </div>
          {/* Actions */}
          <div className="flex gap-2 border-t border-[#F3F4F6] px-4 py-2.5">
            <button
              type="button"
              onClick={acceptImproved}
              className="ma-focus flex-1 rounded-xl bg-[#6366F1] py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#4F46E5]"
            >
              Pakai ini
            </button>
            <button
              type="button"
              onClick={() => setImprovePreview(null)}
              className="ma-focus rounded-xl border border-[#E5E7EB] px-4 py-2 text-[13px] text-[#6B7280] transition-colors hover:bg-[#F7F7F8]"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
      {/* Active skill badge */}
      {activeSkill && (
        <div className="ma-fade-in mb-2 flex items-center gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5">
          <span className="text-[14px]">{activeSkill.icon}</span>
          <span className="flex-1 text-[12px] font-medium text-[#4338CA]">{activeSkill.name} skill aktif</span>
          <button
            type="button"
            onClick={() => setActiveSkill(null)}
            className="ma-focus grid h-4 w-4 place-items-center rounded text-[#6366F1] hover:text-[#4338CA]"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Opus teaser — desktop only */}
      <div className="hidden items-center justify-between px-1 pb-2 sm:flex">
        <p className="text-[13px] text-[#6B7280]">
          Claude Opus-4.8 is coming
        </p>
        <Link
          to="/introducing-opus"
          data-testid="prompt-composer-learn-more"
          className="text-[13px] font-medium text-[#111111] transition-colors hover:text-[#3B6EF6]"
        >
          Learn more
        </Link>
      </div>

      <div
        data-testid="prompt-composer"
        className={`ma-composer relative mx-auto w-full rounded-[24px] border border-[#E5E7EB] bg-white transition-shadow duration-200 ease-out sm:rounded-[28px] ${
          compact ? "p-3 sm:p-3.5 sm:p-4" : "p-3.5 sm:p-4 sm:p-5"
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
        placeholder={
          deepResearchMode ? "Riset topik apa? (akan memakan waktu 1-3 menit...)" :
          uploadedFilesCount > 0 ? "Tanya atau instruksikan tentang file ini..." :
          placeholder || "Ask anything"
        }
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          autoresize(e.target);
          if (next.startsWith("/")) {
            setSlashVisible(true);
          } else {
            setSlashVisible(false);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-label="Ask anything"
        className={`block w-full resize-none border-0 bg-transparent p-1 text-[16px] leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:ring-0 ${
          compact ? "min-h-[40px]" : "min-h-[52px]"
        }`}
      />

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.docx,.xlsx,.xls,.txt,.csv,.md"
            className="hidden"
            onChange={handleFiles}
            data-testid="prompt-composer-file-input"
          />
          {/* Tools Menu (Search Mode + AI Mode + Skills) - replaces 3 separate icons */}
          <ToolsMenu
            searchMode={searchMode}
            onSearchModeChange={(mode) => { setSearchMode(mode.id); }}
            reasoningEnabled={reasoningEnabled}
            onReasoningToggle={onReasoningToggle}
            deepResearchMode={deepResearchMode}
            onDeepResearchToggle={() => setDeepResearchMode((d) => !d)}
            activeSkill={activeSkill}
            onSkillSelect={(skill) => setActiveSkill(skill)}
            onSkillClear={() => setActiveSkill(null)}
          />

          {/* Attach — always visible */}
          <IconAction
            testId="prompt-composer-attach-button"
            label="Attach files"
            icon={Paperclip}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              data-testid="model-selector-trigger"
              aria-label={`Active model: ${model.name}`}
              onClick={() => setDropdownOpen((d) => !d)}
              className="ma-focus flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-2 text-[13px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.98] sm:px-2.5"
            >
              <ModelIcon model={model} size={20} />
              {/* Desktop: show name + credit badge + chevron */}
              <span data-testid="model-selector-label" className="hidden truncate sm:inline">
                {model.name}
              </span>
              <span className="hidden items-center gap-0.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280] sm:inline-flex"
                data-testid="model-credit-badge"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {model.credits}
              </span>
              <ChevronDown size={14} strokeWidth={2} className={`hidden text-[#9CA3AF] transition-transform duration-150 sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
              {/* Mobile: just chevron down */}
              <ChevronDown size={13} strokeWidth={2} className={`text-[#9CA3AF] transition-transform duration-150 sm:hidden ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

              {dropdownOpen && (
              <div
                data-testid="model-dropdown"
                className="ma-fade-in absolute bottom-full right-0 z-50 mb-2 max-h-[70vh] w-[min(280px,calc(100vw-16px))] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
              >
                {MODELS.map((m) => {
                  const isSelected = !autoMode && model.id === m.id;
                  if (m.locked) {
                    return (
                      <Link
                        key={m.id}
                        to={m.lockedHref || "/introducing-opus"}
                        data-testid={`model-dropdown-${m.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#FAFAFA] opacity-60"
                      >
                        <ModelIcon model={m} size={26} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-[#111111]">{m.name}</span>
                            <Lock size={11} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
                          </span>
                          <span className="truncate text-[11px] text-[#9CA3AF]">{m.tag}</span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">
                          Soon
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-testid={`model-dropdown-${m.id}`}
                      onClick={() => selectModel(m)}
                      className={`ma-focus flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#F7F7F8]"
                          : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <ModelIcon model={m} size={26} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-[#111111]">{m.name}</span>
                          {isSelected && <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#111111]" />}
                        </span>
                        <span className="truncate text-[11px] text-[#9CA3AF]">{m.tag}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-semibold text-[#B45309]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        {m.credits}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="improve-prompt-button"
                aria-label="Improve prompt with AI"
                onClick={handleImprovePrompt}
                disabled={improving}
                className={`ma-focus flex h-9 items-center gap-1.5 rounded-xl px-2 text-[13px] font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                  improving
                    ? "animate-pulse bg-[#F5F3FF] text-[#7C3AED]"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
                }`}
              >
                <Sparkles size={16} strokeWidth={1.75} />
                {improving ? (
                  <span className="ma-fade-in hidden text-xs xs:inline">Improving...</span>
                ) : (
                  <span className="hidden text-xs sm:inline">Improve</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Improve prompt with AI
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
                  className="ma-focus grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-white shadow-[0_4px_12px_rgba(17,24,39,0.25)] transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:bg-[#2D2D2D] active:scale-[0.94]"
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
              className={`ma-focus grid h-10 w-10 place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.92] ${
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
      </div>

      <SlashCommandPalette
        query={value}
        visible={slashVisible}
        onSelect={handleSlashSelect}
      />
    </div>
  );
};
