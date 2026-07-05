import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  Mic,
  ArrowUp,
  Search,
  ArrowRight,
  Zap,
  FolderOpen,
  Hammer,
  Map,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createBuilderProject } from "@/lib/supabase";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { BuilderTemplatesDialog } from "@/components/builder/BuilderTemplatesDialog";
import { BuilderHistoryDialog } from "@/components/builder/BuilderHistoryDialog";
import { BuilderFavoritesDialog } from "@/components/builder/BuilderFavoritesDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";

const TABS = [
  { id: "my-projects",  label: "My projects" },
  { id: "recent",       label: "Recently viewed" },
  { id: "templates",    label: "Templates" },
];

// Small app-icon pills for the connect pill
const PILL_ICONS = [
  { label: "G", bg: "#4285F4", text: "#fff" },
  { label: "S", bg: "#4A154B", text: "#fff" },
  { label: "M", bg: "#EA4335", text: "#fff" },
];

// ── Connect pill ───────────────────────────────────────────────────────────
function ConnectPill() {
  return (
    <a
      href="#"
      className="builder-connect-pill"
      aria-label="Connect all your tools"
      onClick={(e) => e.preventDefault()}
    >
      <span className="builder-connect-pill-icons flex items-center">
        {PILL_ICONS.map((p, i) => (
          <span
            key={i}
            className="builder-connect-pill-icon"
            style={{
              background: p.bg,
              color: p.text,
              marginLeft: i === 0 ? 0 : -4,
              zIndex: PILL_ICONS.length - i,
              position: "relative",
            }}
          >
            {p.label}
          </span>
        ))}
      </span>
      <span>Connect all your tools</span>
      <ArrowRight size={12} strokeWidth={2} className="text-[#9CA3AF]" />
    </a>
  );
}

// ── Build mode config ──────────────────────────────────────────────────────
const BUILD_MODES = [
  {
    id: "build",
    label: "Build",
    description: "Generate code directly from your prompt",
    icon: Hammer,
    iconColor: "#6366F1",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Outline the structure before generating",
    icon: Map,
    iconColor: "#0EA5E9",
  },
];

// ── Mode picker dropdown ────────────────────────────────────────────────────
function BuildModePicker({ mode, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = BUILD_MODES.find((m) => m.id === mode) ?? BUILD_MODES[0];
  const Icon = current.icon;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="builder-mode-picker" data-testid="builder-mode-picker">
      <button
        type="button"
        aria-label="Select build mode"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="builder-mode-pill"
        data-testid="builder-mode-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={12} strokeWidth={2} style={{ color: current.iconColor }} />
        {current.label}
        <ChevronDown
          size={12}
          strokeWidth={2}
          className="text-[#9CA3AF]"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}
        />
      </button>

      {open && (
        <div
          className="builder-mode-dropdown"
          role="listbox"
          aria-label="Build mode options"
        >
          {BUILD_MODES.map((m) => {
            const MIcon = m.icon;
            const isSelected = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`builder-mode-option${isSelected ? " selected" : ""}`}
                data-testid={`builder-mode-option-${m.id}`}
                onClick={() => { onChange(m.id); setOpen(false); }}
              >
                <span className="builder-mode-option-icon">
                  <MIcon size={14} strokeWidth={1.75} style={{ color: m.iconColor }} />
                </span>
                <span className="builder-mode-option-text">
                  <span className="builder-mode-option-label">{m.label}</span>
                  <span className="builder-mode-option-desc">{m.description}</span>
                </span>
                {isSelected && (
                  <Check size={13} strokeWidth={2} className="text-[#6366F1] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Input card ─────────────────────────────────────────────────────────────
function BuilderInputCard({ onSubmit }) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState("build");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSubmit?.(value.trim(), mode);
    setValue("");
  };

  return (
    <div className="builder-input-card" role="form" aria-label="Describe what to build">
      <textarea
        ref={textareaRef}
        className="builder-input-textarea"
        placeholder="Ask Builder to make a landing page, app, or document..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        aria-label="Describe what you want to build"
        data-testid="builder-prompt-input"
      />

      <div className="builder-input-toolbar">
        <div className="builder-toolbar-left">
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Attach file"
                className="builder-tool-btn"
                data-testid="builder-attach-btn"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Attach</TooltipContent>
          </Tooltip>
        </div>

        <div className="builder-toolbar-right">
          <BuildModePicker mode={mode} onChange={setMode} />

          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Voice input"
                className="builder-tool-btn"
                data-testid="builder-mic-btn"
              >
                <Mic size={16} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Voice</TooltipContent>
          </Tooltip>

          <button
            type="button"
            aria-label="Send prompt"
            disabled={!value.trim()}
            onClick={handleSend}
            className="builder-send-btn"
            data-testid="builder-send-btn"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state for project grid ───────────────────────────────────────────
function ProjectsEmptyState({ onNewProject }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #E5E7EB" }}
      >
        <FolderOpen size={24} strokeWidth={1.5} className="text-[#9CA3AF]" />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[#374151]">No projects yet</p>
        <p className="text-[13px] text-[#9CA3AF] mt-1">
          Describe what you want to build above to get started
        </p>
      </div>
    </div>
  );
}

// ── Projects section ───────────────────────────────────────────────────────
function ProjectsSection({ onOpenTemplates }) {
  const [activeTab, setActiveTab] = useState("my-projects");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="builder-projects-section" aria-label="Your projects">
      {/* Header row */}
      <div className="builder-section-header">
        {/* Search */}
        <label className="builder-search-bar" htmlFor="builder-project-search">
          <Search size={13} strokeWidth={2} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            id="builder-project-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder-[#9CA3AF] w-full"
            aria-label="Search projects"
            data-testid="builder-project-search"
          />
        </label>

        {/* Tabs */}
        <nav className="builder-tabs" aria-label="Project tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              data-testid={`builder-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`builder-tab${activeTab === tab.id ? " active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Browse templates link */}
        <button
          type="button"
          className="builder-browse-link"
          onClick={onOpenTemplates}
          aria-label="Browse all templates"
        >
          Browse all →
        </button>
      </div>

      {/* Empty state — no projects until Supabase is wired */}
      <ProjectsEmptyState />

      {/* Fade-out bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-16 w-full"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(240,244,255,0.9))",
        }}
      />
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [activeDialog, setActiveDialog] = useState(null);
  // "history" | "favorites" | "templates" | "apps" | "more" | null

  const username = "Radz";

  const handlePromptSubmit = async (prompt, mode = "build") => {
    try {
      const project = await createBuilderProject({
        name: prompt.slice(0, 60) || "Untitled Project",
        last_prompt: prompt,
      });
      navigate(`/project/${project.id}`, {
        state: { initialPrompt: prompt, buildMode: mode },
      });
    } catch (err) {
      console.error("[BuilderPage] createBuilderProject error:", err);
      // Fallback: navigate with a client-side UUID (messages won't persist)
      navigate(`/project/${crypto.randomUUID()}`, {
        state: { initialPrompt: prompt, buildMode: mode },
      });
    }
  };

  const handleNavAction = (id) => {
    setActiveNav(id);
    switch (id) {
      case "home":
        navigate("/builder");
        break;
      case "search":
        setActiveDialog("more");
        break;
      case "history":
        setActiveDialog("history");
        break;
      case "templates":
        setActiveDialog("templates");
        break;
      case "apps":
        setActiveDialog("apps");
        break;
      case "favorites":
        setActiveDialog("favorites");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "inbox":
        setActiveDialog("more");
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#f0f4ff" }}>
      {/* Aurora background */}
      <div className="builder-aurora-bg" aria-hidden="true">
        <div className="builder-aurora-blob" />
      </div>

      {/* Sidebar */}
      <BuilderSidebar
        activeNav={activeNav}
        onNavChange={handleNavAction}
      />

      {/* Main content */}
      <main className="builder-main" id="builder-main-content">
        {/* Hero section */}
        <section
          className="flex flex-col items-center gap-5 w-full"
          aria-labelledby="builder-hero-heading"
          style={{ maxWidth: 660 }}
        >
          <ConnectPill />

          <h1
            id="builder-hero-heading"
            className="text-center font-bold text-[#111111] leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(24px, 4vw, 34px)" }}
          >
            What should we build,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
              }}
            >
              {username}
            </span>
            ?
          </h1>

          <BuilderInputCard onSubmit={handlePromptSubmit} />
        </section>

        {/* Projects section */}
        <ProjectsSection onOpenTemplates={() => setActiveDialog("templates")} />
      </main>

      {/* Dialogs */}
      <BuilderHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <BuilderFavoritesDialog
        open={activeDialog === "favorites"}
        onOpenChange={(open) => setActiveDialog(open ? "favorites" : null)}
      />
      <BuilderTemplatesDialog
        open={activeDialog === "templates"}
        onOpenChange={(open) => setActiveDialog(open ? "templates" : null)}
      />
      <ProjectsDialog
        open={activeDialog === "apps"}
        onOpenChange={(open) => setActiveDialog(open ? "apps" : null)}
      />
      <MoreDialog
        open={activeDialog === "more"}
        onOpenChange={(open) => setActiveDialog(open ? "more" : null)}
      />
    </div>
  );
}
