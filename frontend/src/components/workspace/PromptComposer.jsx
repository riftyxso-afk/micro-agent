import { useAuthModal } from "@/App";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/useSubscription";
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
  GraduationCap,
  Users,
  Telescope,
  Gauge,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Cpu,
  ArrowLeftRight,
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

const IconAction = ({ testId, label, icon: Icon, onClick, active = false, disabled = false }) => (
  <Tooltip delayDuration={200}>
    <TooltipTrigger asChild>
      <button
        type="button"
        data-testid={testId}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={`ma-focus grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
          disabled
            ? "cursor-not-allowed opacity-40 text-[#9CA3AF]"
            : active
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
    webSearch: true,
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

const EFFORT_LEVELS = [
  {
    id: 'low',
    label: 'Low',
    badge: 'Low',
    badgeColor: 'gray',
    description: 'Quick, concise answers',
    isDefault: true,
  },
  {
    id: 'medium',
    label: 'Medium',
    badge: 'Med',
    badgeColor: 'blue',
    description: 'Balanced detail and speed',
    isDefault: false,
  },
  {
    id: 'high',
    label: 'High',
    badge: 'High',
    badgeColor: 'orange',
    description: 'Thorough, well-structured responses',
    isDefault: false,
  },
  {
    id: 'max',
    label: 'Max',
    badge: 'Max',
    badgeColor: 'red',
    description: 'Most comprehensive, uses most tokens',
    isDefault: false,
  },
];

const improvePrompt = (text) => {
  const t = text.trim();
  if (!t || t.length < 3) return "";
  const lower = t.toLowerCase();

  const hasCode = /```|\b(function|const|let|var|import|export|class|def |print)\b/.test(t);
  const hasCompare = lower.includes("compare") || lower.includes("vs") || lower.includes("versus") || lower.includes("bandingkan") || lower.includes("difference");
  const hasExplain = lower.includes("explain") || lower.includes("what") || lower.includes("how") || lower.includes("why") || lower.includes("jelaskan") || lower.includes("apa");
  const hasCreate = lower.includes("create") || lower.includes("build") || lower.includes("make") || lower.includes("generate") || lower.includes("buat") || lower.includes("tulis");
  const hasAnalyze = lower.includes("analyze") || lower.includes("analisa") || lower.includes("review") || lower.includes("evaluate");
  const isQuestion = t.endsWith("?");

  const sections = [];

  // Objective
  if (hasCompare) sections.push("## Objective\nProvide a balanced, feature-by-feature comparison highlighting pros, cons, and ideal use cases for each option.");
  else if (hasCreate) sections.push("## Objective\nGenerate a complete, production-ready output following modern best practices.");
  else if (hasExplain || isQuestion) sections.push("## Objective\nProvide a clear, thorough explanation that builds understanding from first principles.");
  else if (hasAnalyze) sections.push("## Objective\nAnalyze the subject critically, covering strengths, weaknesses, and actionable insights.");
  else sections.push("## Objective\nAddress the prompt with depth, clarity, and practical relevance.");

  // Context
  sections.push("## Context\nAssume I have intermediate domain knowledge. Avoid oversimplifying, but define specialized terms when first introduced.");

  // Format
  if (hasCode) {
    sections.push("## Format\n- Provide code snippets with syntax highlighting\n- Explain the logic behind key implementation decisions\n- Include error handling and edge cases");
  } else if (hasCompare) {
    sections.push("## Format\n- Use a comparison table for quick reference\n- Follow with detailed analysis per category\n- End with a clear recommendation based on different use cases");
  } else if (isQuestion) {
    sections.push("## Format\n- Start with a concise answer (1-2 sentences)\n- Then elaborate with reasoning, evidence, and nuance\n- Use examples or analogies to reinforce understanding");
  } else {
    sections.push("## Format\n- Structure the response with clear headings and subheadings\n- Use bullet points or numbered lists for key information\n- Include practical examples where relevant");
  }

  // Constraints
  const constraints = ["Be thorough but concise — prioritize signal over noise."];
  if (hasCreate) constraints.push("Output must be complete and copy-paste ready.");
  if (hasExplain || isQuestion) constraints.push("If there are multiple perspectives or schools of thought, present them fairly.");
  sections.push(`## Constraints\n- ${constraints.join("\n- ")}`);

  return `## Prompt\n${t}\n\n${sections.join("\n\n")}`;
};

export const PromptComposer = ({
  placeholder,
  onSend,
  onDeepResearch,
  onFileSelect,
  onFileRemove,
  uploadedFilesCount = 0,
  isGenerating = false,
  onStop,
  model,
  autoMode,
  onModelSelect,
  onAutoModeToggle,
  compact = false,
  initialValue = "",
  initialSkill = null,
  initialEffortLevel = "low",
  reasoningEnabled,
  onReasoningToggle,
  tokenBalance = null,
  onRagToggle,
  ragEnabled,
  comparisonEnabled,
  onComparisonToggle,
}) => {
  const navigate = useNavigate();
  const { user, guestRemaining, isGuestLimitReached, GUEST_LIMIT } = useAuth();
  const { isPro } = useSubscription();
  const { openAuth } = useAuthModal();
  const isGuest = !user;
  const [value, setValue] = useState(initialValue);
  const [attachments, setAttachments] = useState([]); // filenames (non-pro) or { file, preview } objects (pro)
  const [fileObjects, setFileObjects] = useState([]); // raw File objects + preview URL for pro mode
  const [previewFile, setPreviewFile] = useState(null); // { name, url, type } for preview modal
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState(initialSkill); // { slug, name, icon }
  const [improving, setImproving] = useState(false);
  const [slashVisible, setSlashVisible] = useState(false);
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [effortLevel, setEffortLevel] = useState(initialEffortLevel);
  const [drillView, setDrillView] = useState(null); // null = model list, 'effort' = effort + reasoning panel
  const [proSectionOpen, setProSectionOpen] = useState(false);
  const [modeDropupOpen, setModeDropupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const deepResearchModeDropup = [modeDropupOpen, setModeDropupOpen];
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
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

  const hasContent = value.trim().length > 0 || attachments.length > 0 || fileObjects.length > 0;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
        // Pro mode: generate local preview URLs for display; parent stores raw files
        const withPreviews = files.map((f) => ({
          file: f,
          name: f.name,
          type: f.type,
          size: f.size,
          preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
        }));
        setFileObjects((prev) => [...prev, ...withPreviews].slice(0, 5));
        // Also pass raw File objects to parent (ChatInterface stores in uploadedFiles)
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

  const removeFileObject = (idx) => {
    setFileObjects((prev) => {
      if (prev[idx]?.preview) URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
    // Notify parent to remove file at same index
    if (onFileRemove) onFileRemove(idx);
  };

  const needsWebSearch = (text) => {
    const lower = text.toLowerCase();
    const TRIGGER_KEYWORDS = [
      'terbaru', 'sekarang', 'hari ini', 'kemarin', 'tahun ini', 'tahun depan',
      'latest', 'current', 'today', 'this year', 'recent', 'breaking',
      'berita', 'news', 'harga', 'price', 'cuaca', 'weather',
      'stock', 'saham', 'crypto', 'bitcoin',
      'siapa', 'siapakah', 'kapan', 'dimana', 'siapa kah',
      'who is', 'who won', 'what happened', 'election', 'pemilu', 'hasil', 'score',
      'vs', 'versus', 'compare', 'perbandingan', 'bandingkan', 'difference',
      'schedule', 'jadwal', 'event', 'release date', 'rilis',
      '2025', '2026', '2027',
    ];
    const containsUrl = /https?:\/\/[^\s]+/.test(text);
    if (containsUrl) return true;
    return TRIGGER_KEYWORDS.some((kw) => lower.includes(kw));
  };

  const handleSend = () => {
    if (!hasContent || isGenerating) return;
    const fileNames = fileObjects.map(f => f.name);
    const text = value.trim() || (fileNames.length ? `Tolong analisis file: ${fileNames.join(", ")}` : `Analyse ${attachments.join(", ")}`);

    // Deep Research mode — route to research handler
    if (deepResearchMode && onDeepResearch) {
      onDeepResearch(text);
      setValue("");
      setAttachments([]);
      setFileObjects((prev) => { prev.forEach(f => f.preview && URL.revokeObjectURL(f.preview)); return []; });
      setSlashVisible(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
      return;
    }

    // Web search always enabled, model decides when to use
    onSend(text, attachments, "", "web", true, activeSkill?.slug || null, effortLevel, false, comparisonEnabled);
    setValue("");
    setAttachments([]);
    // Clear file objects and revoke preview URLs
    setFileObjects((prev) => { prev.forEach(f => f.preview && URL.revokeObjectURL(f.preview)); return []; });
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
    setDrillView("effort");
  };

  // Guest mode: force DeepSeek, disable all features
  const GUEST_MODEL = "deepseek-v4-flash";
  const guestForce = isGuest ? {
    model: { id: GUEST_MODEL, name: "DeepSeek v4 Flash", credits: 1 },
    deepResearch: false,
    comparison: false,
    skills: false,
  } : {};

  return (
    <div className="relative mx-auto w-full">
      {/* Guest mode banner */}
      {isGuest && (
        <div className="mb-2 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] px-3 py-2 text-center">
          <p className="text-[11px] text-[#C2410C]">
            Guest mode — <button onClick={() => openAuth("login")} className="underline font-semibold hover:text-[#9A3412]">Sign in</button> to unlock all models &amp; features
          </p>
        </div>
      )}

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

      {/* Guest mode counter — always visible for guests */}
      {!user && (
        <div className={`mb-3 flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs ${
          isGuestLimitReached
            ? "bg-[#FEF2F2] text-[#991B1B]"
            : guestRemaining <= 3
            ? "bg-[#FEF9C3] text-[#854D0E]"
            : "bg-[#F3F4F6] text-[#374151]"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
              isGuestLimitReached ? "bg-[#EF4444] text-white" : guestRemaining <= 3 ? "bg-[#F59E0B] text-white" : "bg-[#6B7280] text-white"
            }`}>
              {isGuestLimitReached ? "0" : guestRemaining}
            </span>
            <span className="font-medium">
              {isGuestLimitReached
                ? "Guest limit reached"
                : `Guest mode · ${guestRemaining} of ${GUEST_LIMIT} prompt${GUEST_LIMIT !== 1 ? "s" : ""} left`}
            </span>
          </div>
          <Link to="/auth" state={{ from: window.location.pathname }}
            className="ml-3 shrink-0 rounded-lg bg-[#111111] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#374151]">
            Sign in
          </Link>
        </div>
      )}

      <div
        data-testid="prompt-composer"
        className={`ma-composer relative mx-auto w-full rounded-[24px] border border-[#E5E7EB] bg-white transition-shadow duration-200 ease-out sm:rounded-[28px] ${
          compact ? "p-3 sm:p-3.5 sm:p-4" : "p-3.5 sm:p-4 sm:p-5"
        }`}
      >
      {/* Pro mode: file objects with preview */}
      {fileObjects.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2" data-testid="attachment-list">
          {fileObjects.map((f, idx) => (
            <div key={`${f.name}-${idx}`}
              className="ma-fade-in group relative flex items-center gap-1.5 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F7F7F8]"
              style={{ height: 52 }}
            >
              {/* Preview or icon */}
              <button type="button" onClick={() => setPreviewFile(f)}
                className="flex h-full items-center">
                {f.preview ? (
                  <img src={f.preview} alt={f.name} className="h-full w-[52px] object-cover rounded-l-xl" />
                ) : (
                  <div className="flex h-full w-[52px] items-center justify-center rounded-l-xl bg-[#EEF2FF]">
                    <FileText size={18} strokeWidth={1.5} className="text-[#6366F1]" />
                  </div>
                )}
              </button>
              {/* Name */}
              <button type="button" onClick={() => setPreviewFile(f)}
                className="flex max-w-[120px] flex-col items-start pr-6 text-left">
                <span className="truncate text-[11px] font-medium text-[#111111] w-full">{f.name}</span>
                <span className="text-[10px] text-[#9CA3AF]">{f.type?.split("/")[1]?.toUpperCase() || "FILE"}</span>
              </button>
              {/* Remove */}
              <button type="button" onClick={() => removeFileObject(idx)}
                className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[#111111]/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <X size={8} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Non-pro: filename-only attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2" data-testid="attachment-list">
          {attachments.map((name, idx) => (
            <span key={`${name}-${idx}`}
              className="ma-fade-in inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F7F7F8] py-1 pl-2.5 pr-1.5 text-xs text-[#374151]"
            >
              <FileText size={13} strokeWidth={1.75} className="text-[#6B7280]" />
              <span className="max-w-[160px] truncate">{name}</span>
              <button type="button" aria-label={`Remove ${name}`} data-testid={`attachment-remove-${idx}`}
                onClick={() => removeAttachment(idx)}
                className="ma-focus grid place-items-center rounded-full p-0.5 text-[#9CA3AF] transition-colors hover:bg-[#E5E7EB] hover:text-[#111111]">
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* File preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewFile(null)}>
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#F0F1F3] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#111111]">{previewFile.name}</p>
                <p className="text-xs text-[#9CA3AF]">{previewFile.type || "Unknown type"}</p>
              </div>
              <button onClick={() => setPreviewFile(null)}
                className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6]">
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex items-center justify-center bg-[#F7F7F8] p-4" style={{ minHeight: 300 }}>
              {previewFile.preview ? (
                <img src={previewFile.preview} alt={previewFile.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#EEF2FF]">
                    <FileText size={28} strokeWidth={1.5} className="text-[#6366F1]" />
                  </div>
                  <p className="text-sm font-medium text-[#374151]">{previewFile.name}</p>
                  <p className="text-xs text-[#9CA3AF]">Preview tidak tersedia untuk file ini.</p>
                </div>
              )}
            </div>
          </div>
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

      {value.length > 3000 && (
        <div className={`mt-1.5 flex items-center gap-2 ${value.length > 3600 ? "text-amber-600" : "text-amber-500"}`}>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                value.length > 3600 ? "bg-amber-500" : "bg-amber-400"
              }`}
              style={{ width: `${Math.min(100, (value.length / 4000) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-medium">{value.length}/4000</span>
          {value.length > 3600 && (
            <span className="shrink-0 text-[11px] font-medium">90% reached</span>
          )}
        </div>
      )}

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
          {/* Tools Menu (AI Mode + Skills) — hidden for guests */}
          {!isGuest && (
            <ToolsMenu
              reasoningEnabled={reasoningEnabled}
              deepResearchMode={deepResearchMode}
              onDeepResearchToggle={() => setDeepResearchMode((d) => !d)}
              activeSkill={activeSkill}
              onSkillSelect={(skill) => setActiveSkill(skill)}
              onSkillClear={() => setActiveSkill(null)}
              comparisonEnabled={comparisonEnabled}
              onComparisonToggle={onComparisonToggle}
            />
          )}

          {/* RAG Knowledge Base toggle — hidden for guests */}
          {!isGuest && onRagToggle && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onRagToggle}
                  className={`ma-focus grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150 ease-out active:scale-[0.95] ${
                    ragEnabled
                      ? "bg-[#EEF2FF] text-[#6366F1]"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111]"
                  }`}
                >
                  <BookOpen size={18} strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {ragEnabled ? "Knowledge Base ON" : "Knowledge Base OFF"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Supercomputer / Agentic AI */}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="prompt-composer-supercomputer-button"
                aria-label="Supercomputer (Agentic AI)"
                onClick={() => navigate("/studio")}
                className="ma-focus grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors duration-150 ease-out hover:bg-[#F3F4F6] hover:text-[#111111] active:scale-[0.95]"
              >
                <Cpu size={18} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Supercomputer (Agentic AI)
            </TooltipContent>
          </Tooltip>

          {/* Attach — disabled when tokens exhausted */}
          <IconAction
            testId="prompt-composer-attach-button"
            label={tokenBalance === 0 ? "Token habis" : "Attach files"}
            icon={Paperclip}
            onClick={() => {
              if (tokenBalance === 0) {
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={tokenBalance === 0}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              data-testid="model-selector-trigger"
              aria-label={`Active model: ${model.name}`}
              onClick={() => {
                if (isGuest) {
                  toast("Sign in to change model", { description: "Guest mode only supports DeepSeek v4 Flash" });
                  return;
                }
                setDropdownOpen((d) => !d);
              }}
              className={`ma-focus flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-1.5 text-[12px] font-medium transition-colors duration-150 sm:px-2 ${isGuest ? "cursor-not-allowed opacity-60" : "text-[#111111] hover:bg-[#F7F7F8] active:scale-[0.98]"}`}
            >
              <ModelIcon model={model} size={16} />
              <span data-testid="model-selector-label" className="hidden truncate sm:inline max-w-[100px]">
                {model.shortName || model.name}
              </span>
              {!isGuest && <ChevronDown size={12} strokeWidth={2} className={`text-[#9CA3AF] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />}
            </button>

              {dropdownOpen && (
              <div
                data-testid="model-dropdown"
                className="ma-fade-in absolute bottom-full right-0 z-50 mb-2 max-h-[60vh] w-[min(240px,calc(100vw-16px))] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-1 shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
              >
                {drillView === null ? (
                  /* ── Model List ── */
                  <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 8px)" }}>
                    {/* Free models */}
                    <p className="px-2.5 pt-1.5 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">Free</p>
                    {MODELS.filter(m => !m.requiresPro && !m.isExpensive && !m.locked).map((m) => {
                      const isSelected = !autoMode && model.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          data-testid={`model-dropdown-${m.id}`}
                          onClick={() => selectModel(m)}
                          className={`ma-focus flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ${
                            isSelected ? "bg-[#F7F7F8]" : "hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <ModelIcon model={m} size={22} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="flex items-center gap-1">
                              <span className="truncate text-[13px] font-medium text-[#111111]">{m.name}</span>
                              {isSelected && <Check size={12} strokeWidth={2.5} className="shrink-0 text-[#111111]" />}
                            </span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-semibold text-[#B45309]">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            {m.credits}
                          </span>
                        </button>
                      );
                    })}
                    {/* Pro divider — collapsible */}
                    <button type="button" onClick={() => setProSectionOpen(o => !o)}
                      className="ma-focus mx-1 my-1.5 flex w-[calc(100%-8px)] items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-[#F3F4F6] transition-colors">
                      <div className="flex-1 border-t border-[#E5E7EB]" />
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#6366F1]">
                        Pro &amp; Ultra
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${proSectionOpen ? "rotate-180" : ""}`}>
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </span>
                      <div className="flex-1 border-t border-[#E5E7EB]" />
                    </button>
                    {proSectionOpen && MODELS.filter(m => m.requiresPro || m.isExpensive || m.locked).map((m) => {
                      const isSelected = !autoMode && model.id === m.id;
                      const isProLocked = (m.requiresPro || m.isExpensive) && !isPro;
                      if (m.locked && !m.requiresPro) {
                        return (
                          <Link key={m.id} to={m.lockedHref || "/introducing-opus"}
                            data-testid={`model-dropdown-${m.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[#FAFAFA] opacity-60">
                            <ModelIcon model={m} size={22} />
                            <span className="truncate text-[13px] font-medium text-[#111111] flex-1">{m.name}</span>
                            <Lock size={10} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
                            <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-semibold text-[#B45309]">Soon</span>
                          </Link>
                        );
                      }
                      if (isProLocked) {
                        return (
                          <Link key={m.id} to="/pricing"
                            data-testid={`model-dropdown-${m.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[#FAFAFA] opacity-60">
                            <ModelIcon model={m} size={22} />
                            <span className="truncate text-[13px] font-medium text-[#111111] flex-1">{m.name}</span>
                            <Lock size={10} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
                            <span className="shrink-0 rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-semibold text-[#6366F1]">Pro</span>
                          </Link>
                        );
                      }
                      return (
                        <button key={m.id} type="button"
                          data-testid={`model-dropdown-${m.id}`}
                          onClick={() => selectModel(m)}
                          className={`ma-focus flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ${
                            isSelected ? "bg-[#F7F7F8]" : "hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <ModelIcon model={m} size={22} />
                          <span className="flex min-w-0 flex-1 items-center gap-1">
                            <span className="truncate text-[13px] font-medium text-[#111111]">{m.name}</span>
                            {isSelected && <Check size={12} strokeWidth={2.5} className="shrink-0 text-[#111111]" />}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-semibold text-[#B45309]">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            {m.credits}
                          </span>
                          <ChevronRight size={12} strokeWidth={1.75} className="shrink-0 text-[#9CA3AF]" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* ── Effort + Reasoning Panel (drillView === 'effort') ── */
                  <div>
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setDrillView(null)}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
                    >
                      <ChevronLeft size={14} strokeWidth={1.75} />
                      Models
                    </button>
                    {/* Selected model name */}
                    <div className="mb-1 flex items-center gap-2 px-2 py-1">
                      <ModelIcon model={model} size={20} />
                      <span className="text-sm font-semibold text-[#111111]">{model.name}</span>
                    </div>
                    <div className="border-t border-[#E5E7EB]" />
                    {/* Effort Levels */}
                    <div className="px-1 pt-1.5 pb-0.5">
                      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Effort</p>
                      {EFFORT_LEVELS.map((level) => {
                        const active = effortLevel === level.id;
                        return (
                          <button
                            key={level.id}
                            type="button"
                            data-testid={`effort-option-${level.id}`}
                            onClick={() => { setEffortLevel(level.id); }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors duration-100 ${
                              active ? "bg-[#F7F7F8]" : "hover:bg-[#FAFAFA]"
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1.5 text-xs font-medium text-[#111111]">
                                {level.label}
                                {level.isDefault && (
                                  <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[9px] font-normal text-[#6B7280]">Default</span>
                                )}
                              </span>
                              <span className="text-[10px] text-[#6B7280]">{level.description}</span>
                            </div>
                            {active && <Check size={13} strokeWidth={2.5} className="shrink-0 text-[#111111]" />}
                          </button>
                        );
                      })}
                    </div>
                    {/* Reasoning Toggle */}
                    <div className="border-t border-[#E5E7EB] px-1 pt-1.5 pb-1 mt-1">
                      <button
                        type="button"
                        data-testid="reasoning-toggle"
                        onClick={() => { onReasoningToggle?.(); }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors duration-100 hover:bg-[#FAFAFA]"
                      >
                        <span className="flex items-center gap-2 text-xs font-medium text-[#111111]">
                          <Brain size={14} strokeWidth={1.75} />
                          Show Reasoning
                        </span>
                        <span className={`text-[10px] font-semibold ${reasoningEnabled ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`}>
                          {reasoningEnabled ? "ON" : "OFF"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
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
