import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { QuickChips } from "@/components/workspace/QuickChips";
import { Logo } from "@/components/workspace/Logo";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/workspaceData";

export default function HomeWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [activeNav, setActiveNav] = useState("new");
  const [collapsed, setCollapsed] = useState(false);
  const [activeChip, setActiveChip] = useState(null);
  const [placeholder, setPlaceholder] = useState("Ask anything");
  const [model, setModel] = useState(() => getModelById(DEFAULT_MODEL_ID));
  const [autoMode, setAutoMode] = useState(false);
  const reduceMotion = useReducedMotion();

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
      <div aria-hidden="true" className="ma-hero-glow" />

      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="absolute left-4 top-4 z-30 md:hidden">
        <Logo size={34} />
      </div>

      <header className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <UserMenu />
      </header>

      <main
        className={`relative flex min-h-dvh flex-col items-center justify-center px-4 pb-28 pt-20 transition-[margin] duration-300 ease-out sm:px-6 md:pb-16 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <div className="w-full max-w-[860px] -translate-y-[2vh]">
          <motion.div {...fadeUp(0)} className="text-center">
            <h1
              data-testid="greeting-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl lg:text-[56px] lg:leading-[1.1]"
            >
              Good afternoon, Riftyxso
            </h1>
            <p className="mt-3 text-base text-[#6B7280] md:text-[17px]">
              Your AI super workspace is ready
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="mt-9 sm:mt-11">
            <PromptComposer
              placeholder={placeholder}
              initialValue={initialPrompt}
              onSend={handleSend}
              model={model}
              autoMode={autoMode}
              onModelSelect={handleModelSelect}
              onAutoModeToggle={handleAutoModeToggle}
            />
          </motion.div>

          <motion.div {...fadeUp(0.16)} className="mt-6 sm:mt-7">
            <QuickChips activeChip={activeChip} onChipClick={handleChipClick} />
          </motion.div>
        </div>
      </main>

      <MobileNav activeNav={activeNav} onNavChange={setActiveNav} />
    </div>
  );
}
