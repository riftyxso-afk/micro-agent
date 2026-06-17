import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/useSubscription";
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
import { API_BASE_URL } from "@/lib/chatApi";

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
  const { user, session, isGuestLimitReached, GUEST_LIMIT, incrementGuestCount } = useAuth();
  const { plan, isPro, isUltra } = useSubscription();

  // Fetch token balance
  const [tokenBalance, setTokenBalance] = useState(null);
  const fetchTokenBalance = useCallback(async () => {
    if (!user) { setTokenBalance(null); return; }
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/credits/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTokenBalance(data.balance ?? 0);
    } catch {
      setTokenBalance(null);
    }
  }, [user, session]);

  useEffect(() => { fetchTokenBalance(); }, [fetchTokenBalance]);

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

  const handleSend = (text, attachments = [], searchModePrompt = "", searchModeId = "off", modeWebSearch = false, skillSlug = null, effortLevel = "low") => {
    const allowed = incrementGuestCount();
    if (!allowed) {
      navigate("/auth", { state: { from: "/home", tab: "login" } });
      toast("Prompt limit reached", { description: `Sign in to continue. Guest limit: ${GUEST_LIMIT} prompts.` });
      return;
    }
    navigate("/chat", {
      state: {
        prompt: text,
        modelId: model.id,
        autoMode,
        chipId: activeChip,
        attachments,
        searchModePrompt,
        searchModeId,
        modeWebSearch,
        skillSlug,
        effortLevel,
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

    const name = user?.email?.split("@")[0] || "";
    return name ? `${greeting}, ${name}` : greeting;
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* UserMenu top-right — mobile shifts right to avoid hamburger */}
      <header className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <UserMenu />
      </header>

      <main
        className={`relative flex min-h-dvh flex-col items-center justify-center px-4 pb-28 pt-20 transition-[margin] duration-300 ease-out sm:px-8 sm:pt-24 md:pb-16 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <div className="w-full max-w-[680px] -translate-y-[2vh]">
          <motion.div {...fadeUp(0)} className="text-center">
            {/* Plan badge */}
            <div className="mb-4 flex justify-center">
              {user ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#6B7280] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                  <span className={`h-1.5 w-1.5 rounded-full ${isUltra ? "bg-purple-500" : isPro ? "bg-blue-500" : "bg-emerald-500"}`} />
                  {isUltra ? "Ultra" : isPro ? "Pro" : "Free Plan"}
                  {!isPro && <>
                    <span className="mx-1 h-3 w-px bg-[#E5E7EB]" />
                    <button onClick={() => navigate("/pricing")} className="font-semibold text-[#6366F1] hover:text-[#4338CA] transition-colors">
                      Upgrade
                    </button>
                  </>}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#9CA3AF] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D1D5DB]" />
                  Guest
                  <span className="mx-1 h-3 w-px bg-[#E5E7EB]" />
                  <button onClick={() => navigate("/auth")} className="font-semibold text-[#6366F1] hover:text-[#4338CA] transition-colors">
                    Sign in
                  </button>
                </span>
              )}
            </div>
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
              tokenBalance={tokenBalance}
            />
          </motion.div>

          <motion.div {...fadeUp(0.16)} className="mt-4 sm:mt-6">
            <QuickChips
              activeChip={activeChip}
              onChipClick={handleChipClick}
              onRecommendation={handleRecommendation}
            />
          </motion.div>

          {!user && (
            <motion.div {...fadeUp(0.22)} className="mt-5 hidden justify-center sm:flex sm:mt-6">
              <button
                type="button"
                data-testid="signin-badge"
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 py-1.5 px-3 text-xs backdrop-blur-sm text-[#6366F1] font-medium transition-colors hover:text-[#4338CA]"
              >
                Sign in for full access
              </button>
            </motion.div>
          )}
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
