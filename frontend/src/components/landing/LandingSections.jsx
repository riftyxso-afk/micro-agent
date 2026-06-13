import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessagesSquare,
  Wand2,
  GitCompareArrows,
  FileUp,
  LayoutGrid,
  Coins,
  Search,
  GraduationCap,
  PenLine,
  Code2,
  Zap,
  ArrowRight,
  FileText,
  Sparkles,
  CircleCheck,
} from "lucide-react";
import { Logo } from "@/components/workspace/Logo";
import { MODELS } from "@/lib/workspaceData";
import { ModelIcon } from "@/components/workspace/ModelIcon";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
};

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const SectionShell = ({ id, children, className = "" }) => (
  <section id={id} className={`relative z-10 px-6 py-20 sm:py-24 ${className}`}>
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </section>
);

const SectionHeading = ({ title, description }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    className="mx-auto mb-12 max-w-2xl text-center"
  >
    <h2 className="text-3xl font-medium tracking-tight text-[#111111] sm:text-4xl md:text-[44px] md:leading-[1.1]">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-relaxed text-[#6B7280] md:text-lg">
        {description}
      </p>
    )}
  </motion.div>
);

/* ============ Features ============ */

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Multi-model chat",
    description:
      "Chat with GPT, Claude, Gemini, Grok, DeepSeek, Qwen, Llama, and more.",
  },
  {
    icon: Wand2,
    title: "Auto Mode",
    description: "Let MicroAgent choose the best model based on your task.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare AI",
    description:
      "Send one prompt to multiple models and combine the best answer.",
  },
  {
    icon: FileUp,
    title: "Upload files",
    description: "Upload PDF or TXT files and ask questions about them.",
  },
  {
    icon: LayoutGrid,
    title: "AI Rooms",
    description: "Use focused rooms for Research, Study, Content, and Code.",
  },
  {
    icon: Coins,
    title: "Credit control",
    description: "Smarter models cost more credits, fast models cost less.",
  },
];

export const FeaturesSection = () => (
  <SectionShell id="features">
    <SectionHeading title="Everything you need to work with AI" />
    <motion.div
      variants={staggerGrid}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="features-grid"
    >
      {FEATURES.map((f) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={f.title}
            variants={fadeUp}
            className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
          >
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-[#F4F6FB] text-[#4D6BFE] transition-transform duration-200 ease-out group-hover:scale-105">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[#111111]">
              {f.title}
            </h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#6B7280]">
              {f.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  </SectionShell>
);

/* ============ AI Rooms ============ */

const ROOMS = [
  {
    id: "research",
    icon: Search,
    name: "Research Room",
    description: "Web-ready answers with structured sources and summaries.",
    example: "e.g., “Summarize the latest EV battery breakthroughs”",
  },
  {
    id: "study",
    icon: GraduationCap,
    name: "Study Room",
    description: "Step-by-step explanations, flashcards, and practice questions.",
    example: "e.g., “Explain Bayes' theorem like I'm 15”",
  },
  {
    id: "content",
    icon: PenLine,
    name: "Content Room",
    description: "Drafts, posts, scripts, and docs in your tone of voice.",
    example: "e.g., “Write a launch thread for my new app”",
  },
  {
    id: "code",
    icon: Code2,
    name: "Code Room",
    description: "Generate, review, and debug code with coding-tuned models.",
    example: "e.g., “Build a Dynamic Island component in HTML”",
  },
];

const ROOM_CHIP_MAP = {
  research: "research",
  study: "solve",
  content: "create",
  code: "create",
};

export const RoomsSection = () => {
  const navigate = useNavigate();
  return (
    <SectionShell id="rooms" className="bg-[#F7F7F8]">
      <SectionHeading
        title="Choose a room. Start faster."
        description="Focused spaces with the right model, prompt style, and tools already set up."
      />
      <motion.div
        variants={staggerGrid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="rooms-grid"
      >
        {ROOMS.map((room) => {
          const Icon = room.icon;
          return (
            <motion.div
              key={room.id}
              variants={fadeUp}
              className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E0F2FE] to-[#EDE9FE] text-[#4338CA]">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#111111]">
                {room.name}
              </h3>
              <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[#6B7280]">
                {room.description}
              </p>
              <p className="mt-3 text-[12.5px] italic text-[#9CA3AF]">
                {room.example}
              </p>
              <button
                type="button"
                data-testid={`room-start-${room.id}`}
                onClick={() => {
                  const chipId = ROOM_CHIP_MAP[room.id];
                  navigate(chipId ? `/home?chipId=${chipId}` : "/home");
                }}
                className="ma-focus mt-4 inline-flex h-9 w-fit items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 text-[13px] font-medium text-[#111111] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-[#F7F7F8] hover:shadow-sm active:scale-[0.98]"
              >
                Start
                <ArrowRight size={13} strokeWidth={2} />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionShell>
  );
};

/* ============ Credit System ============ */

// Derive credit display from shared MODELS to stay in sync with app model picker
const CREDIT_MODELS = MODELS.filter((m) => m.id !== "minimax-m2-7").map((m) => ({
  id: m.id,
  name: m.name,
  credits: m.credits,
  color: m.color,
  tag: m.tag,
  ultra: m.isExpensive || false,
}));

export const CreditsSection = () => (
  <SectionShell id="credits">
    <SectionHeading
      title="Use the right model for the right task"
      description="Fast models are cheaper. Smarter models cost more. MicroAgent makes AI usage transparent with simple credits."
    />
    <motion.div
      variants={staggerGrid}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="credits-grid"
    >
      {CREDIT_MODELS.map((m) => (
        <motion.div
          key={m.name}
          variants={fadeUp}
          className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#F0F1F3] bg-[#FAFAFA]">
            <ModelIcon model={m} size={24} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 truncate text-[14.5px] font-semibold text-[#111111]">
              {m.name}
              {m.ultra && (
                <span className="rounded-full bg-[#FEF3C7] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
                  Ultra
                </span>
              )}
            </span>
            <span className="truncate text-xs text-[#6B7280]">{m.tag}</span>
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[12px] font-semibold ${
              m.ultra ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#F7F7F8] text-[#6B7280]"
            }`}
          >
            <Zap size={11} strokeWidth={2.25} className="fill-[#F59E0B] text-[#F59E0B]" />
            {m.credits}
          </span>
        </motion.div>
      ))}
    </motion.div>
    <motion.p
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mx-auto mt-8 max-w-xl text-center text-[13px] leading-relaxed text-[#9CA3AF]"
    >
      GPT 5.5 uses ⚡400 credits per message — save it for complex reasoning or
      important tasks.
    </motion.p>
  </SectionShell>
);

/* ============ Compare AI ============ */

export const CompareSection = () => {
  const [combined, setCombined] = useState(false);

  return (
    <SectionShell id="compare" className="bg-[#F7F7F8]">
      <SectionHeading
        title="Compare answers from multiple AI models"
        description="Ask once, compare responses, then combine the strongest answer into one final result."
      />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto max-w-4xl"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* DeepSeek card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ModelIcon model={MODELS.find((m) => m.id === "deepseek-v4-pro")} size={18} />
              <span className="text-[13.5px] font-medium text-[#111111]">
                DeepSeek v4 Pro
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                <Zap size={10} strokeWidth={2.25} className="fill-[#F59E0B] text-[#F59E0B]" />5
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#374151]">
              A four-day workweek boosts focus and retention. Start with a
              3-month pilot, measure output — not hours — and protect deep-work
              blocks with async updates.
            </p>
          </div>
          {/* Gemini card */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ModelIcon model={MODELS.find((m) => m.id === "gemini-3-1-pro")} size={18} />
              <span className="text-[13.5px] font-medium text-[#111111]">
                Gemini 3.1 Pro
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F7F7F8] px-1.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                <Zap size={10} strokeWidth={2.25} className="fill-[#F59E0B] text-[#F59E0B]" />30
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#374151]">
              Evidence from 60+ company trials shows revenue held steady while
              burnout dropped 71%. The key risks: meeting compression and
              customer coverage gaps — plan rotations early.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            data-testid="combine-answer-button"
            onClick={() => setCombined(true)}
            disabled={combined}
            className={`ma-focus inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14.5px] font-medium transition-[box-shadow,transform] duration-200 ease-out active:scale-[0.98] ${
              combined
                ? "cursor-default border border-neutral-200 bg-white text-[#9CA3AF]"
                : "bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            }`}
          >
            <Sparkles size={16} strokeWidth={1.75} />
            {combined ? "Combined" : "Combine best answer"}
          </button>
        </div>

        {combined && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
            data-testid="combined-answer-card"
            className="ma-combined-card mt-5 rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(17,24,39,0.08)]"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="ma-logo-mark grid h-6 w-6 place-items-center rounded-lg">
                <Sparkles size={13} strokeWidth={2} className="text-white" />
              </span>
              <span className="text-[13.5px] font-semibold text-[#111111]">
                Combined answer
              </span>
              <span className="text-xs text-[#9CA3AF]">
                DeepSeek v4 Pro + Gemini 3.1 Pro
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-[#374151]">
              Run a 3-month four-day-week pilot and measure output, not hours.
              Trials across 60+ companies kept revenue steady while burnout fell
              71%. Protect deep-work blocks with async updates, compress
              meetings deliberately, and plan coverage rotations before launch.
            </p>
          </motion.div>
        )}
      </motion.div>
    </SectionShell>
  );
};

/* ============ Upload File ============ */

export const UploadSection = () => (
  <SectionShell id="upload">
    <SectionHeading
      title="Upload files. Ask anything."
      description="Drop your PDFs, notes, or documents into MicroAgent and ask questions directly from your files."
    />
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2"
      data-testid="upload-section-cards"
    >
      {/* Upload card */}
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
        <span className="ma-float mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
          <FileText size={24} strokeWidth={1.5} />
        </span>
        <p className="text-[15px] font-semibold text-[#111111]">
          quarterly-report.pdf
        </p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">2.4 MB · ready for Q&A</p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-medium text-[#047857]">
          <CircleCheck size={13} strokeWidth={2} />
          Indexed
        </span>
      </div>
      {/* Q&A preview */}
      <div className="flex flex-col justify-center gap-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="self-end rounded-3xl rounded-br-lg bg-[#EDEEF1] px-4 py-2.5 text-[13.5px] text-[#111111]">
          What drove the revenue change in Q3?
        </div>
        <div className="rounded-3xl rounded-bl-lg border border-neutral-200 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-[#374151] shadow-sm">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-[#6B7280]">
            <ModelIcon model={MODELS.find((m) => m.id === "deepseek-v4-pro")} size={16} />
            DeepSeek v4 Pro · from your file
          </span>
          Q3 revenue grew 18% — page 12 attributes it to enterprise renewals
          and the new usage-based tier.
        </div>
      </div>
    </motion.div>
  </SectionShell>
);

/* ============ Final CTA ============ */

export const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <SectionShell id="cta" className="bg-[#F7F7F8]">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-[36px] border border-neutral-200 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(17,24,39,0.06)]"
      >
        <div aria-hidden="true" className="ma-cta-glow" />
        <h2 className="relative text-3xl font-medium tracking-tight text-[#111111] sm:text-4xl md:text-[44px]">
          Start with one prompt.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6B7280] md:text-lg">
          Open MicroAgent, choose what you want to do, and let the right AI
          model help you.
        </p>
        <button
          type="button"
          data-testid="final-cta-button"
          onClick={() => navigate("/home")}
          className="ma-focus relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-black px-8 text-[15.5px] font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-[box-shadow,transform] duration-200 ease-out hover:bg-neutral-800 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)] active:scale-[0.98]"
        >
          Start for free
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </motion.div>
    </SectionShell>
  );
};

/* ============ Footer ============ */

const FOOTER_LINKS = ["Product", "Models", "Rooms", "Pricing", "Privacy", "Terms"];

export const LandingFooter = () => (
  <footer id="footer" className="relative z-10 border-t border-neutral-200 bg-white px-6 py-12">
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2.5">
        <Logo size={28} />
        <span className="text-[17px] font-medium tracking-tight text-black">
          MicroAgent
        </span>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] text-[#6B7280]">
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href="#footer"
            onClick={(e) => e.preventDefault()}
            className="ma-focus rounded-lg transition-colors hover:text-[#111111]"
          >
            {label}
          </a>
        ))}
      </nav>
      <p className="text-[12.5px] text-[#9CA3AF]">
        © 2026 MicroAgent. All rights reserved.
      </p>
    </div>
  </footer>
);
