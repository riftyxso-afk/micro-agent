import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { QuickChips } from "@/components/workspace/QuickChips";
import { Logo } from "@/components/workspace/Logo";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";
import { getModelById, DEFAULT_MODEL_ID, QUICK_CHIPS } from "@/lib/workspaceData";

export default function HomeWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialModelId = searchParams.get("modelId") || DEFAULT_MODEL_ID;
  const initialAutoMode = searchParams.get("autoMode") === "1";
  const initialChipId = searchParams.get("chipId");
  const initialChip = QUICK_CHIPS.find((chip) => chip.id === initialChipId);
  const initialWebSearch = searchParams.get("webSearch") === "1";

  const [activeNav, setActiveNav] = useState("new");
  const [activeDialog, setActiveDialog] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeChip, setActiveChip] = useState(initialChip?.id || null);
  const [placeholder, setPlaceholder] = useState(initialChip?.hint || "Ask anything");
  const [model, setModel] = useState(() => getModelById(initialModelId));
  const [autoMode, setAutoMode] = useState(initialAutoMode);
  const [composerInitial, setComposerInitial] = useState(initialPrompt);
  const reduceMotion = useReducedMotion();

  const handleNavChange = (navId) => {
    setActiveNav(navId);
    if (navId === "history" || navId === "projects" || navId === "more") {
      setActiveDialog(navId);
    }
  };

  const handleChipClick = (chip) => {
    if (activeChip === chip.id) {
      setActiveChip(null);
      setPlaceholder("Ask anything");
    } else {
      setActiveChip(chip.id);
      setPlaceholder(chip.hint);
    }
  };

  const handleModelSelect = (m, isAuto) => {
    if (isAuto) {
      setAutoMode(true);
    } else {
      setAutoMode(false);
      setModel(m);
    }
  };

  const handleAutoModeToggle = () => {
    const next = !autoMode;
    setAutoMode(next);
    toast(next ? "Auto Mode on" : "Auto Mode off", {
      description: next
        ? "MicroAgent picks the best model for every prompt"
        : `Back to ${model.name}`,
    });
  };

  const handleSend = (text) => {
    navigate("/chat", {
      state: {
        prompt: text,
        modelId: model.id,
        autoMode,
        chipId: activeChip,
      },
    });
  };

  const handleRecommendation = (text) => {
    setComposerInitial(text);
  };

  const greeting = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const d = now.getDay();

    const emoji = h < 6 ? "🌙" : h < 12 ? "🌤️" : h < 17 ? "☀️" : h < 21 ? "🌅" : "🌙";
    const part = h < 6 ? "night" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";

    const greetings = {
      morning: ["Good morning", "Morning", "Rise and shine"],
      afternoon: ["Good afternoon", "Hey there", "Good day"],
      evening: ["Good evening", "Hey", "Welcome back"],
      night: ["Still working?", "Late night", "Hey night owl"],
    };

    const picks = greetings[part];
    const greeting = picks[Math.floor(Math.random() * picks.length)];

    return `${greeting}, Riftyxso`;
  }, []);

  const subtitle = useMemo(() => {
    const h = new Date().getHours();
    const d = new Date().getDay();
    const msgs = {
      morning: [
        "Ready to create something today?",
        "Fresh start — what's on your mind?",
        "New ideas waiting to happen",
      ],
      afternoon: [
        "Keep the momentum going",
        "What are we tackling next?",
        "Stay in the flow",
      ],
      evening: [
        "Winding down or powering through?",
        "One last deep dive?",
        "Evening sessions hit different",
      ],
      night: [
        "Quiet hours — perfect for focus",
        "The world is sleeping, you're building",
        "Late night deep work mode",
      ],
    };
    const part = h < 6 ? "night" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
    const picks = msgs[part];
    const isWeekend = d === 0 || d === 6;
    const weekendMsg = isWeekend ? "Weekend mode — take your time" : null;
    return weekendMsg ?? picks[Math.floor(Math.random() * picks.length)];
  }, []);

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98], delay },
        };

  return (
    <div className="ma-page relative min-h-dvh">
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onLogoClick={() => navigate("/home")}
      />

      <div className="absolute left-4 top-4 z-30 md:hidden">
        <Logo size={34} />
      </div>

      <header className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <UserMenu />
      </header>

      <main
        className={`relative flex min-h-dvh flex-col items-center justify-center px-3 pb-28 pt-16 transition-[margin] duration-300 ease-out sm:px-6 sm:pt-20 md:pb-16 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <div className="w-full max-w-[860px] -translate-y-[2vh]">
          <motion.div {...fadeUp(0)} className="text-center">
            <h1
              data-testid="greeting-heading"
              className="font-heading text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl lg:text-5xl"
            >
              {greeting}
            </h1>
            <p className="mt-1.5 text-sm text-[#6B7280] sm:mt-2 sm:text-base">
              {subtitle}
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="mt-5 sm:mt-9">
            <PromptComposer
              placeholder={placeholder}
              initialValue={composerInitial}
              initialWebSearch={initialWebSearch}
              onSend={handleSend}
              model={model}
              autoMode={autoMode}
              onModelSelect={handleModelSelect}
              onAutoModeToggle={handleAutoModeToggle}
            />
          </motion.div>

          <motion.div {...fadeUp(0.16)} className="mt-4 sm:mt-6">
            <QuickChips
              activeChip={activeChip}
              onChipClick={handleChipClick}
              onRecommendation={handleRecommendation}
            />
          </motion.div>

          <motion.div {...fadeUp(0.22)} className="mt-5 flex justify-center sm:mt-6">
            <div
              data-testid="plan-badge"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 py-1.5 px-3 text-xs backdrop-blur-sm"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-[#374151]">Free Plan</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <button
                type="button"
                data-testid="upgrade-plan-button"
                onClick={() => navigate("/pricing")}
                className="ma-focus font-medium text-[#6366F1] transition-colors duration-150 hover:text-[#4338CA]"
              >
                Upgrade now
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />

      <HistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <ProjectsDialog
        open={activeDialog === "projects"}
        onOpenChange={(open) => setActiveDialog(open ? "projects" : null)}
      />
      <MoreDialog
        open={activeDialog === "more"}
        onOpenChange={(open) => setActiveDialog(open ? "more" : null)}
      />
    </div>
  );
}
