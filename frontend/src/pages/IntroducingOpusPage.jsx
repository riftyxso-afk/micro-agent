import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Brain, Globe, Code, ArrowRight, Check, Bell, ChevronRight } from "lucide-react";

const FEATURES = [
  { icon: Brain, title: "Extended Reasoning",
    desc: "Opus-4.8 thinks longer and deeper — tackling multi-step problems that require sustained logic across complex domains." },
  { icon: Code, title: "Superior Coding",
    desc: "Writes, reviews, and refactors large codebases with greater accuracy. It understands architecture, not just syntax." },
  { icon: Globe, title: "Real-time Web Awareness",
    desc: "Native web search integration lets Opus-4.8 ground answers in current events and up-to-date documentation." },
  { icon: Zap, title: "Faster at Scale",
    desc: "Despite being our most capable model yet, Opus-4.8 is optimised to deliver responses with significantly reduced latency." },
];

const TIMELINE = [
  { label: "Research complete", done: true },
  { label: "Safety evaluation", done: true },
  { label: "Limited beta", done: false, tag: "Up next" },
  { label: "General availability", done: false },
];

const STATS = [
  { score: "92.4%", label: "GPQA Diamond", sub: "Graduate reasoning" },
  { score: "67.8%", label: "SWE-bench", sub: "Coding accuracy" },
  { score: "98.1%", label: "HumanEval", sub: "Code generation" },
];

export default function IntroducingOpusPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const fadeUp = (delay = 0) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay },
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            aria-label="Go back">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <span className="text-[13px] font-medium text-[#6B7280]">MicroAgent Blog</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-16 sm:px-6">
        {/* Hero */}
        <motion.div {...fadeUp(0)} className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
            <span className="h-2 w-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-[12px] font-semibold text-[#6366F1]">Now available</span>
          </div>

          <h1 className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-[#111111]">
            Meet Claude
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#A5B4FC] bg-clip-text text-transparent">
              Opus-4.8
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#6B7280]">
            Our most intelligent model yet — setting a new standard for reasoning, coding, and
            real-world problem solving. Now available on MicroAgent.
          </p>
        </motion.div>

        {/* Performance hero card */}
        <motion.div {...fadeUp(0.08)} className="mx-auto mt-12 max-w-3xl">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] p-[2px]">
            <div className="rounded-3xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] p-8 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Performance benchmarks</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {STATS.map((stat) => (
                  <div key={stat.label}
                    className="rounded-2xl bg-white/10 px-5 py-5 text-center backdrop-blur-sm transition-all hover:bg-white/[0.15]">
                    <p className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-white">{stat.score}</p>
                    <p className="mt-1 text-[13px] font-medium text-white/80">{stat.label}</p>
                    <p className="text-[11px] text-white/50">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeUp(0.12)} className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">What's new</h2>
            <p className="mt-3 text-[15px] text-[#6B7280]">Everything that makes Opus-4.8 a generational leap forward.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} {...fadeUp(0.14 + i * 0.05)}
                  className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#EEF2FF] transition-colors group-hover:bg-[#E0E7FF]">
                    <Icon size={20} strokeWidth={1.75} className="text-[#6366F1]" />
                  </div>
                  <p className="font-semibold text-[#111111]">{f.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280]">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div {...fadeUp(0.28)} className="mx-auto mt-20 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">Release timeline</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <div className="divide-y divide-[#E5E7EB]">
              {TIMELINE.map((step, i) => (
                <div key={step.label}
                  className={`flex items-center gap-4 px-6 py-4 ${step.done ? "" : "opacity-50"}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    step.done ? "border-[#6366F1] bg-[#6366F1]" : "border-[#E5E7EB]"
                  }`}>
                    {step.done ? <Check size={12} strokeWidth={3} className="text-white" /> : null}
                  </span>
                  <span className={`flex-1 text-[14px] font-medium ${step.done ? "text-[#111111]" : "text-[#9CA3AF]"}`}>
                    {step.label}
                  </span>
                  {step.tag && (
                    <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#B45309]">
                      {step.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA with email */}
        <motion.div {...fadeUp(0.34)} className="mx-auto mt-20 max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-10 shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-[#EEF2FF] opacity-50 blur-3xl" />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1">
                <Bell size={12} strokeWidth={2} className="text-[#6366F1]" />
                <span className="text-[11px] font-semibold text-[#6366F1]">Stay updated</span>
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-[#111111] sm:text-2xl">
                Get notified about new models
              </h2>
              <p className="mt-2 text-[14px] text-[#6B7280]">
                Be the first to know when we launch Opus-4.8 and future models. No spam — just product updates.
              </p>
              {subscribed ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center gap-3 rounded-2xl bg-[#F0FDF4] px-5 py-4">
                  <Check size={18} strokeWidth={2.5} className="text-[#059669]" />
                  <div>
                    <p className="text-sm font-semibold text-[#166534]">You're on the list!</p>
                    <p className="text-xs text-[#059669]">We'll notify you when Opus-4.8 launches.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-6 flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com" required
                    className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#6366F1]/50"
                  />
                  <button type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#2D2D2D] active:scale-[0.98]">
                    Notify Me
                    <ArrowRight size={15} strokeWidth={2} />
                  </button>
                </form>
              )}
              <div className="mt-6 flex items-center gap-2 border-t border-[#E5E7EB] pt-5">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-[#6366F1] to-[#A5B4FC]" />
                  ))}
                </div>
                <p className="text-xs text-[#6B7280]">
                  Join <span className="font-semibold text-[#111111]">2,410+</span> early adopters
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pro upsell */}
        <motion.div {...fadeUp(0.4)} className="mx-auto mt-8 max-w-2xl">
          <button type="button" onClick={() => navigate("/pricing")}
            className="group flex w-full items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition-all hover:shadow-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles size={18} strokeWidth={1.75} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#111111]">Upgrade to Pro</p>
              <p className="text-xs text-[#6B7280]">Get priority access to Opus-4.8 and every new model</p>
            </div>
            <ChevronRight size={16} strokeWidth={1.75} className="text-[#9CA3AF] transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
