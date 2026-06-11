import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMenu } from "@/components/workspace/UserMenu";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { QuickChips } from "@/components/workspace/QuickChips";
import { Logo } from "@/components/workspace/Logo";

export default function HomeWorkspace() {
  const [activeNav, setActiveNav] = useState("new");
  const [collapsed, setCollapsed] = useState(false);
  const [activeChip, setActiveChip] = useState(null);
  const [placeholder, setPlaceholder] = useState("Ask anything");
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
      {/* Soft hero glow */}
      <div aria-hidden="true" className="ma-hero-glow" />

      {/* Desktop sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Mobile top-left logo */}
      <div className="absolute left-4 top-4 z-30 md:hidden">
        <Logo size={34} />
      </div>

      {/* Top-right avatar */}
      <header className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <UserMenu />
      </header>

      {/* Main content */}
      <main
        className={`relative flex min-h-dvh flex-col items-center justify-center px-4 pb-28 pt-20 transition-[margin] duration-300 ease-out sm:px-6 md:pb-16 ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <div className="w-full max-w-[860px] -translate-y-[2vh]">
          {/* Greeting */}
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

          {/* Prompt composer */}
          <motion.div {...fadeUp(0.08)} className="mt-9 sm:mt-11">
            <PromptComposer placeholder={placeholder} />
          </motion.div>

          {/* Quick action chips */}
          <motion.div {...fadeUp(0.16)} className="mt-6 sm:mt-7">
            <QuickChips activeChip={activeChip} onChipClick={handleChipClick} />
          </motion.div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav activeNav={activeNav} onNavChange={setActiveNav} />
    </div>
  );
}
