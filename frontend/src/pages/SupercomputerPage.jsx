import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSubscription } from "@/lib/useSubscription";

const MODES = [
  { id: "efficient", label: "Efficient mode", icon: "⚡" },
  { id: "deep",      label: "Deep Research",  icon: "🔭" },
  { id: "creative",  label: "Creative mode",  icon: "✨" },
  { id: "expert",    label: "Expert mode",    icon: "🧠" },
];

const CAPABILITIES = [
  {
    id: 1, title: "Deep Research & Reports",
    description: "Research any topic and generate comprehensive PDF reports",
    tag: "RESEARCH", image: "🔭",
  },
  {
    id: 2, title: "Generate Documents",
    description: "Create PDF, Excel, Word files from a single prompt",
    tag: "DOCUMENT", image: "📄",
  },
  {
    id: 3, title: "Analyze Data & Files",
    description: "Upload files and get deep AI-powered analysis",
    tag: "ANALYSIS", image: "📊",
  },
  {
    id: 4, title: "Build & Code",
    description: "Generate full applications and code solutions",
    tag: "CODE", image: "💻",
  },
  {
    id: 5, title: "Create Content",
    description: "Write viral posts, articles, and marketing copy",
    tag: "CONTENT", image: "✍️",
  },
  {
    id: 6, title: "Automate Tasks",
    description: "Multi-step autonomous task execution end-to-end",
    tag: "AUTOMATION", image: "⚡",
  },
];

const SIDEBAR_ICONS = [
  { icon: "🏠", label: "Home",     href: "/" },
  { icon: "🔍", label: "Search",   href: "/search" },
  { icon: "📦", label: "Elements", href: "/elements" },
  { icon: "⚡", label: "Skills",   href: "/skills" },
  { icon: "📚", label: "Library",  href: "/library" },
];

export default function SupercomputerPage() {
  const navigate = useNavigate();
  const { isPro, loading } = useSubscription();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(MODES[0]);
  const [showModes, setShowModes] = useState(false);
  const inputRef = useRef(null);

  function handleRun() {
    if (!input.trim()) return;
    navigate(`/supercomputer/run?task=${encodeURIComponent(input)}&mode=${mode.id}`);
  }

  useEffect(() => {
    if (!loading && !isPro) navigate("/pricing", { replace: true });
  }, [loading, isPro, navigate]);

  if (loading) return <div className="min-h-dvh bg-[#111]" />;
  if (!isPro) return null;

  return (
    <div className="sc2-layout">
      {/* ── Left Sidebar ── */}
      <div className="sc2-sidebar">
        <div className="sc2-sidebar-logo">
          <div className="sc2-logo-icon">M</div>
        </div>
        <nav className="sc2-sidebar-nav">
          {SIDEBAR_ICONS.map((item) => (
            <Link key={item.href} to={item.href} className="sc2-nav-item" title={item.label}>
              <span className="sc2-nav-icon">{item.icon}</span>
            </Link>
          ))}
        </nav>
        <div className="sc2-sidebar-bottom">
          <button className="sc2-nav-item" title="Settings">⚙️</button>
          <button className="sc2-nav-item" title="Profile">👤</button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="sc2-main">
        {/* ── Hero section ── */}
        <div className="sc2-hero">
          <div className="sc2-hero-shortcuts">
            <button className="sc2-shortcuts-btn">⌨️ Shortcuts</button>
          </div>

          <div className="sc2-hero-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#1a1a1a" />
              <path d="M16 20 Q20 12 24 20 Q28 28 32 20" stroke="#c5f135" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M14 28 Q18 20 22 28 Q26 36 30 28 Q34 20 36 26" stroke="#c5f135" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          <h1 className="sc2-hero-title">SUPERCOMPUTER FOR CREATIVE WORK</h1>
          <p className="sc2-hero-subtitle">Turn a simple chat into production-ready content at scale</p>

          {/* ── Input box ── */}
          <div className="sc2-input-wrapper">
            <div className="sc2-input-box">
              <button className="sc2-input-plus">+</button>

              <div className="sc2-mode-wrapper">
                <button className="sc2-mode-btn" onClick={() => setShowModes(!showModes)}>
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                  <span className="sc2-mode-chevron">∨</span>
                </button>
                {showModes && (
                  <div className="sc2-mode-dropdown">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        className={`sc2-mode-option ${mode.id === m.id ? "active" : ""}`}
                        onClick={() => { setMode(m); setShowModes(false); }}
                      >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                        {mode.id === m.id && <span className="sc2-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                className="sc2-input"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
              />

              <button className={`sc2-send-btn ${input.trim() ? "active" : ""}`} onClick={handleRun}>
                {input.trim() ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l8 8-8 8V4z" />
                  </svg>
                ) : (
                  <span className="sc2-ask-label">Ask ∨</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Feature card ── */}
          <div className="sc2-feature-card">
            <div className="sc2-feature-img">
              <div className="sc2-feature-illustration">
                <span style={{ fontSize: "48px" }}>🤖</span>
                <span style={{ fontSize: "32px", marginLeft: "-8px" }}>⚡</span>
              </div>
            </div>
            <div className="sc2-feature-content">
              <div className="sc2-feature-badge">
                Automate with AI <span className="sc2-badge-new">NEW</span>
              </div>
              <p className="sc2-feature-desc">
                It plans the strategy, executes multi-step tasks, and delivers production-ready results for you
              </p>
              <button
                className="sc2-feature-btn"
                onClick={() => { setInput("Automate my workflow"); inputRef.current?.focus(); }}
              >
                Try now
              </button>
            </div>
          </div>
        </div>

        {/* ── Capabilities grid ── */}
        <div className="sc2-capabilities">
          <div className="sc2-cap-header">
            <div>
              <h2 className="sc2-cap-title">What can the Supercomputer do?</h2>
              <p className="sc2-cap-subtitle">Research, documents, code, content, and more</p>
            </div>
            <button className="sc2-browse-btn">🗂️ Browse more</button>
          </div>

          <div className="sc2-cap-grid">
            {CAPABILITIES.map((cap) => (
              <button
                key={cap.id}
                className="sc2-cap-card"
                onClick={() => {
                  setInput(cap.description);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => inputRef.current?.focus(), 500);
                }}
              >
                <div className="sc2-cap-img">
                  <span style={{ fontSize: "40px" }}>{cap.image}</span>
                </div>
                <div className="sc2-cap-info">
                  <span className="sc2-cap-tag">{cap.tag}</span>
                  <span className="sc2-cap-name">{cap.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
