import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Brain, Globe, Code, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Extended Reasoning",
    desc: "Opus-4.8 thinks longer and deeper — tackling multi-step problems that require sustained logic across complex domains.",
  },
  {
    icon: Code,
    title: "Superior Coding",
    desc: "Writes, reviews, and refactors large codebases with greater accuracy. It understands architecture, not just syntax.",
  },
  {
    icon: Globe,
    title: "Real-time Web Awareness",
    desc: "Native web search integration lets Opus-4.8 ground answers in current events and up-to-date documentation.",
  },
  {
    icon: Zap,
    title: "Faster at Scale",
    desc: "Despite being our most capable model yet, Opus-4.8 is optimised to deliver responses with significantly reduced latency.",
  },
];

const TIMELINE = [
  { label: "Research complete", done: true },
  { label: "Safety evaluation", done: true },
  { label: "Limited beta", done: false },
  { label: "General availability", done: false },
];

export default function IntroducingOpusPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay },
        };

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <span className="text-[13px] font-medium text-[#6B7280]">MicroAgent Blog</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
        <motion.div {...fadeUp(0)}>
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-1 text-[12px] font-semibold text-[#3B6EF6]">
              <Sparkles size={12} strokeWidth={2} />
              Announcing
            </span>
            <span className="text-[12px] text-[#9CA3AF]">Coming soon</span>
          </div>

          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-[#111111] sm:text-5xl">
            Introducing Claude
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] bg-clip-text text-transparent">
              Opus-4.8
            </span>
          </h1>

          <p className="mt-5 text-[17px] leading-relaxed text-[#6B7280]">
            Our most intelligent model yet. Opus-4.8 sets a new standard for reasoning, coding, and
            real-world problem solving — available soon on MicroAgent.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.08)} className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#818CF8]">
          <div className="px-8 py-10 text-white">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/60">Performance</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90">
              Opus-4.8 scores best-in-class across graduate-level reasoning (GPQA), advanced coding
              (SWE-bench), and long-context comprehension. Built for the hardest tasks you can throw at it.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { score: "92.4%", label: "GPQA Diamond" },
                { score: "67.8%", label: "SWE-bench" },
                { score: "98.1%", label: "HumanEval" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/10 px-4 py-4 text-center backdrop-blur-sm">
                  <p className="font-heading text-2xl font-semibold">{stat.score}</p>
                  <p className="mt-1 text-[11px] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.12)} className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-[#111111]">What's new</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(0.14 + i * 0.05)}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_4px_rgba(17,24,39,0.04)]"
              >
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[#F7F7F8]">
                  <f.icon size={18} strokeWidth={1.75} className="text-[#6366F1]" />
                </div>
                <p className="font-medium text-[#111111]">{f.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.28)} className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-[#111111]">Release timeline</h2>
          <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <ol className="relative space-y-5 border-l border-[#E5E7EB] pl-6">
              {TIMELINE.map((step, i) => (
                <li key={step.label} className="relative">
                  <span
                    className={`absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-[#6366F1] bg-[#6366F1]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    {step.done && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <p
                    className={`text-[14px] font-medium ${
                      step.done ? "text-[#111111]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {step.label}
                  </p>
                  {!step.done && i === TIMELINE.findIndex((s) => !s.done) && (
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#B45309]">
                      Up next
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.34)} className="mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
          <h2 className="font-heading text-lg font-semibold text-[#111111]">Get early access</h2>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            Upgrade to Pro to be first in line when Opus-4.8 launches. Pro users get priority access
            to every new model the moment it goes live.
          </p>
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#2D2D2D] active:scale-[0.98]"
          >
            Upgrade to Pro
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
