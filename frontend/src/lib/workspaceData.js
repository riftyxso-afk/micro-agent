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

export const MODELS = [
  {
    id: "gemini-2-5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    shortName: "Flash Lite",
    credits: 1,
    color: "#4285F4",
    tag: "Fastest everyday answers",
    categories: ["speed"],
  },
  {
    id: "minimax-m2-7",
    name: "MiniMax M2.7",
    shortName: "MiniMax",
    credits: 1,
    color: "#E2552C",
    tag: "Quick drafts at low cost",
    categories: ["speed"],
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    shortName: "Haiku",
    credits: 5,
    color: "#D97757",
    tag: "Crisp, natural writing",
    categories: ["writing", "speed"],
  },
  {
    id: "kimi-k2-6",
    name: "Kimi K2.6",
    shortName: "Kimi",
    credits: 5,
    color: "#6B4EFF",
    tag: "Long-context reasoning",
    categories: ["reasoning", "writing"],
  },
  {
    id: "grok-4-3",
    name: "Grok 4.3",
    shortName: "Grok",
    credits: 10,
    color: "#1F2937",
    tag: "Sharp logic and code",
    categories: ["reasoning", "coding"],
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek v4 Pro",
    shortName: "DeepSeek",
    credits: 5,
    color: "#4D6BFE",
    tag: "Balanced pro performance",
    categories: ["pro", "coding", "reasoning"],
  },
  {
    id: "gemini-3-1-pro",
    name: "Gemini 3.1 Pro",
    shortName: "Gemini Pro",
    credits: 30,
    color: "#1A73E8",
    tag: "Deep multimodal reasoning",
    categories: ["pro", "reasoning"],
  },
  {
    id: "gpt-5-5",
    name: "GPT 5.5",
    shortName: "GPT 5.5",
    credits: 400,
    color: "#10A37F",
    tag: "Ultra-grade frontier model",
    categories: ["pro", "reasoning", "coding", "writing"],
    isExpensive: true,
  },
];

export const DEFAULT_MODEL_ID = "deepseek-v4-pro";
export const AUTO_PICKED_MODEL_ID = "gemini-3-1-pro";

export const getModelById = (id) =>
  id === "auto" ? AUTO_MODEL : MODELS.find((m) => m.id === id) || MODELS[5];

export const MODEL_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "pro", label: "Pro" },
  { id: "reasoning", label: "Reasoning" },
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "speed", label: "Speed" },
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
