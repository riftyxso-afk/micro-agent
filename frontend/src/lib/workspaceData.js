import {
  Plus,
  History,
  FolderClosed,
  Ellipsis,
  Search,
  PenLine,
  ChartColumn,
  Palette,
  Puzzle,
  Sparkles,
  Globe,
  Palette as PaletteIcon,
  Code,
  FileText,
  BookOpen,
  Lightbulb,
  Scale,
  Languages,
  Mail,
  Rocket,
  Wand2,
  List,
  MessageCircle,
  Brain,
  Zap,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "new", label: "New", icon: Plus },
  { id: "history", label: "History", icon: History },
  { id: "projects", label: "Projects", icon: FolderClosed },
  { id: "more", label: "More", icon: Ellipsis },
];

export const AUTO_MODEL = {
  id: "auto",
  name: "Auto Select Model",
  shortName: "Auto Select",
  credits: null,
  color: "#A5B4FC",
  tag: "Picks the best model for every prompt",
  categories: [],
  isAuto: true,
};

export const IMAGE_MODEL = {
  id: "flux-2-klein-4b",
  name: "Flux 2 Klein 4B",
  shortName: "Flux",
  credits: 1,
  color: "#F97316",
  tag: "Image generation",
  categories: ["image"],
  isImageModel: true,
};

export const MODELS = [
  {
    id: "claude-sonnet-4-5-1m",
    name: "Claude Sonnet 4.5 (1M)",
    shortName: "Sonnet 1M",
    credits: 2,
    color: "#D97757",
    tag: "Long context reasoning",
    categories: ["reasoning", "writing", "coding"],
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek v4 Flash",
    shortName: "DeepSeek",
    credits: 1,
    color: "#4D6BFE",
    tag: "Fast & open-weight",
    categories: ["reasoning", "coding"],
  },
  {
    id: "glm-5",
    name: "GLM-5",
    shortName: "GLM-5",
    credits: 1,
    color: "#06B6D4",
    tag: "Advanced multilingual reasoning",
    categories: ["reasoning", "writing", "coding"],
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    shortName: "Opus",
    credits: 5,
    color: "#7C3AED",
    tag: "Most intelligent model",
    categories: ["reasoning", "writing", "coding"],
    isLocked: true,
    locked: true,
    lockedHref: "/introducing-opus",
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    shortName: "Kimi",
    credits: 1,
    color: "#0EA5E9",
    tag: "Multimodal & long context",
    categories: ["reasoning", "writing", "coding"],
  },
  {
    id: "minimax-m3",
    name: "MiniMax M3",
    shortName: "MiniMax",
    credits: 1,
    color: "#6366F1",
    tag: "Fast & efficient",
    categories: ["reasoning", "writing", "coding"],
  },
];

export const DEFAULT_MODEL_ID = "deepseek-v4-flash";
export const AUTO_PICKED_MODEL_ID = "deepseek-v4-flash";

export const getModelById = (id) =>
  id === "auto" ? AUTO_MODEL : MODELS.find((m) => m.id === id) || MODELS[0];

export const MODEL_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "reasoning", label: "Reasoning" },
  { id: "writing", label: "Writing" },
  { id: "coding", label: "Coding" },
];

export const QUICK_CHIPS = [
  {
    id: "research",
    label: "Research",
    icon: Search,
    room: "Research Room",
    hint: "Research any topic — answers with sources",
  },
  {
    id: "create",
    label: "Create",
    icon: PenLine,
    room: "Content Room",
    hint: "Create content — drafts, posts, scripts, docs",
  },
  {
    id: "analyse",
    label: "Analyse",
    icon: ChartColumn,
    room: "File/Research Mode",
    hint: "Analyse data or files — drop them in",
  },
  {
    id: "imagine",
    label: "Imagine",
    icon: Palette,
    room: "Image Mode",
    hint: "Imagine anything — describe the visual",
  },
  {
    id: "solve",
    label: "Solve",
    icon: Puzzle,
    room: "Study/Reasoning Mode",
    hint: "Solve a problem — step by step",
  },
];

export const CHIP_RECOMMENDATIONS = {
  research: [
    { id: "r1", text: "Explain quantum computing in simple terms" },
    { id: "r2", text: "Compare React vs Vue for building a SaaS dashboard" },
    { id: "r3", text: "What are the latest breakthroughs in AI agents?" },
    { id: "r4", text: "Summarise the key takeaways from recent tech conferences" },
  ],
  create: [
    { id: "c1", text: "Write a catchy product launch announcement" },
    { id: "c2", text: "Draft a README for an open source CLI tool" },
    { id: "c3", text: "Create a social media thread about productivity hacks" },
    { id: "c4", text: "Write a cold outreach email for a SaaS startup" },
  ],
  analyse: [
    { id: "a1", text: "Analyse this CSV sales data and find trends" },
    { id: "a2", text: "Compare Q1 vs Q2 revenue from these numbers" },
    { id: "a3", text: "Review this code for performance bottlenecks" },
    { id: "a4", text: "Summarise key insights from this report" },
  ],
  imagine: [
    { id: "i1", text: "A futuristic workspace with holographic screens" },
    { id: "i2", text: "Minimal mobile app UI for a meditation timer" },
    { id: "i3", text: "Cyberpunk city street at midnight with neon signs" },
    { id: "i4", text: "Isometric illustration of a data centre" },
  ],
  solve: [
    { id: "s1", text: "Why is my React app re-rendering too much?" },
    { id: "s2", text: "How to optimise slow MongoDB queries?" },
    { id: "s3", text: "Debug authentication loop in Next.js app" },
    { id: "s4", text: "Reduce bundle size of a webpack project" },
  ],
};

export const DEFAULT_ROOM = "Chat Room";

export const THINKING_STEPS = [
  "Understanding the request",
  "Choosing the best approach",
  "Generating the response",
];

export const DYNAMIC_ISLAND_CODE = {
  filename: "dynamic-island.html",
  language: "html",
  content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #f4f4f5; font-family: -apple-system, sans-serif; }

    .island {
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 10px;
      background: #000;
      color: #fff;
      padding: 10px 18px;
      border-radius: 24px;
      cursor: pointer;
      transition:
        padding 0.45s cubic-bezier(0.32, 0.72, 0, 1),
        border-radius 0.45s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .island.expanded {
      padding: 20px 26px;
      border-radius: 34px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c759;
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      50% { opacity: 0.35; transform: scale(0.8); }
    }
  </style>
</head>
<body>
  <div class="island" onclick="this.classList.toggle('expanded')">
    <span class="dot"></span>
    <span>Now Playing · Tap to expand</span>
  </div>
</body>
</html>`,
};

export const EXAMPLE_USER_PROMPT =
  "Create an iOS Dynamic Island notification component in HTML with animations.";

export const EXAMPLE_ASSISTANT_TEXT =
  "Sure — here is a clean self-contained HTML implementation for an iOS Dynamic Island notification component with multiple notification states and smooth animations. The component sits pinned to the top of the viewport, expands with a spring-like easing curve on tap, and uses a pulsing status dot to signal live activity — no external libraries required.";

const CODE_PATTERN = /\b(code|html|css|component|animation|build|website|page|button|ui)\b/i;

export const buildMockAnswer = (prompt, room) => {
  if (CODE_PATTERN.test(prompt)) {
    return {
      text: EXAMPLE_ASSISTANT_TEXT,
      code: DYNAMIC_ISLAND_CODE,
    };
  }
  const topic = prompt.length > 70 ? `${prompt.slice(0, 70).trim()}…` : prompt;
  const roomLine =
    room && room !== DEFAULT_ROOM ? `Working in ${room} mode, ` : "";
  return {
    text: `Here's a focused take on “${topic}”. ${roomLine}I broke it down into the essentials so it's easy to act on. The short version: start with the outcome you want, identify the two or three constraints that actually matter, and iterate from a small working version. Key points to keep in mind — keep the scope tight at first, validate each assumption against a real example, and document what you decide so the next step is obvious. If you'd like, I can go deeper on any part of this, compare alternatives side by side, or turn it into a step-by-step plan.`,
    code: null,
  };
};

export const SLASH_COMMANDS = [
  {
    name: "improve",
    label: "Improve prompt",
    desc: "Rewrite your prompt for clarity and detail",
    icon: Wand2,
    category: "Prompt",
    type: "transform",
    transform: (text) => `${text}\n\nPlease provide a detailed, well-structured response with practical examples and key considerations.`,
  },
  {
    name: "shorter",
    label: "Make shorter",
    desc: "Ask for a concise version",
    icon: FileText,
    category: "Prompt",
    type: "transform",
    transform: (text) => `${text}\n\nKeep the answer brief and to the point — 3-4 sentences max.`,
  },
  {
    name: "longer",
    label: "Make longer",
    desc: "Ask for a detailed version",
    icon: BookOpen,
    category: "Prompt",
    type: "transform",
    transform: (text) => `${text}\n\nProvide a comprehensive, in-depth answer covering all relevant aspects.`,
  },
  {
    name: "explain",
    label: "Explain like I'm a beginner",
    desc: "Simplify the explanation",
    icon: Lightbulb,
    category: "Prompt",
    type: "transform",
    transform: (text) => `${text}\n\nExplain it as if I'm a complete beginner with no prior knowledge.`,
  },
  {
    name: "compare",
    label: "Compare options",
    desc: "Ask for pros, cons, and use cases",
    icon: Scale,
    category: "Prompt",
    type: "transform",
    transform: (text) => `${text}\n\nCompare the main options with pros, cons, and recommended use cases.`,
  },
  {
    name: "translate",
    label: "Translate",
    desc: "Translate the prompt to another language",
    icon: Languages,
    category: "Prompt",
    type: "transform",
    transform: (text) => `Translate the following to English:\n${text}`,
  },
  {
    name: "code",
    label: "Write code",
    desc: "Request code implementation",
    icon: Code,
    category: "Action",
    type: "transform",
    transform: (text) => `Write clean, well-commented code for: ${text}`,
  },
  {
    name: "summarise",
    label: "Summarise",
    desc: "Get a short summary",
    icon: List,
    category: "Action",
    type: "transform",
    transform: (text) => `Summarise the key points of:\n${text}`,
  },
  {
    name: "web",
    label: "Search the web",
    desc: "Find up-to-date information online",
    icon: Globe,
    category: "Action",
    type: "action",
    action: "enable_web_search",
  },
  {
    name: "brainstorm",
    label: "Brainstorm ideas",
    desc: "Generate creative ideas around a topic",
    icon: Brain,
    category: "Creative",
    type: "transform",
    transform: (text) => `Brainstorm 10 creative and diverse ideas related to: ${text}`,
  },
  {
    name: "email",
    label: "Draft email",
    desc: "Write a professional email",
    icon: Mail,
    category: "Creative",
    type: "transform",
    transform: (text) => `Draft a professional email about:\n${text}`,
  },
  {
    name: "critique",
    label: "Critique & improve",
    desc: "Review and suggest improvements",
    icon: MessageCircle,
    category: "Creative",
    type: "transform",
    transform: (text) => `Critique the following and suggest specific improvements:\n${text}`,
  },
  {
    name: "step-by-step",
    label: "Step by step",
    desc: "Break into actionable steps",
    icon: Rocket,
    category: "Action",
    type: "transform",
    transform: (text) => `Break this down into a clear step-by-step plan:\n${text}`,
  },
  {
    name: "debate",
    label: "Play devil's advocate",
    desc: "Challenge the assumption",
    icon: Zap,
    category: "Creative",
    type: "transform",
    transform: (text) => `Play devil's advocate and challenge this idea:\n${text}\n\nProvide counter-arguments and alternative perspectives.`,
  },
];
