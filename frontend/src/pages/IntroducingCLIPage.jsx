import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, Terminal, Download, Package, Monitor,
  Zap, Code, Globe, Bot, ChevronRight, Check, Copy, ExternalLink
} from "lucide-react";

const INSTALL_METHODS = [
  {
    id: "local",
    label: "Local",
    icon: Terminal,
    cmd: "git clone https://github.com/riftyxso-afk/micro-agent.git && cd micro-agent/cli && pip install -e .",
  },
  {
    id: "pip",
    label: "pip (dev)",
    icon: Download,
    cmd: "pip install -e /path/to/Micro-Agent-CLI",
  },
  {
    id: "curl",
    label: "curl",
    icon: Package,
    cmd: 'curl -fsSL https://github.com/riftyxso-afk/micro-agent/raw/main/cli/install.sh | bash',
    disabled: true,
  },
  {
    id: "npm",
    label: "npm",
    icon: Monitor,
    cmd: "npm install /path/to/Micro-Agent-CLI/npm",
    disabled: true,
  },
];

const FEATURES = [
  { icon: Zap, title: "AI-Powered Coding",
    desc: "Autonomous task execution — plan, code, test, fix errors, and open apps, all from the terminal." },
  { icon: Code, title: "7 Built-in Tools",
    desc: "Bash, read, write, edit, grep, glob, open — everything you need to interact with your codebase." },
  { icon: Globe, title: "Multi-Provider",
    desc: "Works with OpenAI, Anthropic, DeepSeek, and any OpenAI-compatible API. Switch models at runtime." },
  { icon: Bot, title: "Smart Agent Loop",
    desc: "Self-correcting agent with tool-calling, plan extraction, and up to 50 iterations for complex tasks." },
];

const COMMANDS = [
  { cmd: "/help", desc: "Show all commands" },
  { cmd: "/task <desc>", desc: "Run autonomous coding task" },
  { cmd: "/model <id>", desc: "Switch AI model" },
  { cmd: "/new", desc: "Reset session" },
  { cmd: "/save", desc: "Save session" },
  { cmd: "/clear", desc: "Clear screen" },
  { cmd: "/info", desc: "Session info" },
  { cmd: "/exit", desc: "Quit" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#6B7280] transition-colors hover:bg-white/10 hover:text-white"
      data-testid={`copy-${text.slice(0, 10)}`}>
      {copied ? <Check size={13} strokeWidth={2.5} className="text-[#22C55E]" /> : <Copy size={13} strokeWidth={1.75} />}
    </button>
  );
}

export default function IntroducingCLIPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [activeInstall, setActiveInstall] = useState("curl");

  const fadeUp = (delay = 0) => reduceMotion ? {} : {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay },
  };

  const activeMethod = INSTALL_METHODS.find((m) => m.id === activeInstall);

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
            aria-label="Go back" data-testid="cli-back-button">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <span className="text-[13px] font-medium text-[#6B7280]">MicroAgent CLI</span>
          <a href="/home"
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#2D2D2D] active:scale-[0.98]"
            data-testid="cli-try-button">
            Try in Browser
            <ExternalLink size={12} strokeWidth={1.75} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-16 sm:px-6">
        {/* Hero */}
        <motion.div {...fadeUp(0)} className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
            <span className="h-2 w-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="text-[12px] font-semibold text-[#2DD4BF]">Now available</span>
          </div>

          <div className="mx-auto mb-6 inline-block rounded-2xl bg-[#0A0A0A] px-6 py-3 font-mono text-[11px] leading-relaxed text-[#2DD4BF] shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <span className="text-[#6B7280]">❯</span> microagent /task "Buatkan REST API dengan Express"
          </div>

          <h1 className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-[#111111]">
            Meet
            <br />
            <span className="bg-gradient-to-r from-[#2DD4BF] via-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent">
              MicroAgent CLI
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#6B7280]">
            An autonomous AI coding assistant that lives in your terminal.
            Code, debug, run apps, and manage files — all through natural language.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeUp(0.12)} className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">Why the CLI?</h2>
            <p className="mt-3 text-[15px] text-[#6B7280]">
              Same AI power as MicroAgent web, right in your terminal workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} {...fadeUp(0.14 + i * 0.05)}
                  className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
                  data-testid={`cli-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#F0FDFA] transition-colors group-hover:bg-[#CCFBF1]">
                    <Icon size={20} strokeWidth={1.75} className="text-[#14B8A6]" />
                  </div>
                  <p className="font-semibold text-[#111111]">{f.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280]">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Install */}
        <motion.div {...fadeUp(0.28)} className="mx-auto mt-20 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">Install</h2>
          <p className="mt-3 text-[15px] text-[#6B7280]">
            Choose your platform. Requires Python 3.10+.
          </p>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 rounded-xl bg-[#F3F4F6] p-1" data-testid="install-tabs">
            {INSTALL_METHODS.map((m) => {
              const Icon = m.icon;
              const active = activeInstall === m.id;
              return (
                <button key={m.id} onClick={() => setActiveInstall(m.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    active ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(17,24,39,0.08)]" : "text-[#6B7280] hover:text-[#111111]"
                  } ${m.disabled ? "opacity-40" : ""}`}
                  data-testid={`install-tab-${m.id}`}>
                  <Icon size={14} strokeWidth={1.75} />
                  {m.label}
                  {m.disabled && <span className="ml-1 rounded-full bg-[#E5E7EB] px-1.5 py-0.5 text-[9px] font-medium text-[#9CA3AF]">soon</span>}
                </button>
              );
            })}
          </div>

          {/* Code block */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#0A0A0A] shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-2.5">
              <span className="text-[11px] font-medium text-[#6B7280]">Terminal</span>
              <CopyButton text={activeMethod.cmd} />
            </div>
            <div className="overflow-x-auto px-5 py-4">
              <code className="block whitespace-nowrap font-mono text-[13px] leading-relaxed text-[#E5E7EB]">
                <span className="text-[#6B7280]">$ </span>{activeMethod.cmd}
              </code>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#9CA3AF]">
            Already installed? Run <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[11px] text-[#111111]">microagent</code> to start.
          </p>
        </motion.div>

        {/* Quick start */}
        <motion.div {...fadeUp(0.36)} className="mx-auto mt-20 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">Quick start</h2>
          <div className="mt-8 space-y-4">
            {[
              { label: "Set up API keys", cmd: 'echo "OPENAI_BASE_URL=https://api.aimurah.my.id/v1\\nOPENAI_API_KEY=sk-..." > .env' },
              { label: "Launch the CLI", cmd: "microagent" },
              { label: "Ask anything", cmd: "Buatkan saya REST API dengan Express.js" },
              { label: "Or run a task", cmd: "/task Refactor backend/auth ke TypeScript" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#111111] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#111111]">{step.label}</p>
                  <div className="mt-1.5 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#0A0A0A]">
                    <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                      <span className="text-[10px] font-medium text-[#6B7280]">Terminal</span>
                      <CopyButton text={step.cmd} />
                    </div>
                    <div className="px-4 py-3">
                      <code className="block font-mono text-[12px] leading-relaxed text-[#E5E7EB]">
                        <span className="text-[#6B7280]">$ </span>{step.cmd}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Commands reference */}
        <motion.div {...fadeUp(0.44)} className="mx-auto mt-20 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold text-[#111111] sm:text-3xl">Commands</h2>
          <p className="mt-3 text-[15px] text-[#6B7280]">
            Type <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[13px] text-[#111111]">/</code> at the prompt to see all available commands.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <div className="divide-y divide-[#E5E7EB]">
              {COMMANDS.map((c, i) => (
                <div key={c.cmd}
                  className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[#FAFAFA]">
                  <code className="min-w-[8rem] font-mono text-[13px] font-medium text-[#2DD4BF]">{c.cmd}</code>
                  <span className="text-[13px] text-[#6B7280]">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.5)} className="mx-auto mt-20 max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-10 shadow-[0_1px_4px_rgba(17,24,39,0.04)]">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-[#F0FDFA] opacity-50 blur-3xl" />
            <div className="relative text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#0A0A0A]">
                <Terminal size={24} strokeWidth={1.75} className="text-[#2DD4BF]" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-[#111111] sm:text-2xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[#6B7280]">
                Install MicroAgent CLI and bring AI-powered coding to your terminal.
                Works on macOS, Linux, and Windows.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a href="#"
                  onClick={(e) => { e.preventDefault(); document.querySelector("[data-testid='install-tabs']")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#2D2D2D] active:scale-[0.98]"
                  data-testid="cli-cta-install">
                  <Download size={15} strokeWidth={1.75} />
                  Install Now
                </a>
                <a href="/home"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition-all hover:bg-[#FAFAFA] active:scale-[0.98]">
                  Try Web Version
                  <ChevronRight size={15} strokeWidth={1.75} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
