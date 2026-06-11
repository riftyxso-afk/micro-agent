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

export const MODELS = [
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek v4 Pro",
    credits: 5,
    color: "#4D6BFE",
    tag: "Deep reasoning",
  },
  {
    id: "gpt-4-1",
    name: "GPT-4.1",
    credits: 8,
    color: "#10A37F",
    tag: "General purpose",
  },
  {
    id: "claude-3-7",
    name: "Claude 3.7",
    credits: 10,
    color: "#D97757",
    tag: "Writing & nuance",
  },
  {
    id: "gemini-2-5",
    name: "Gemini 2.5",
    credits: 6,
    color: "#4285F4",
    tag: "Multimodal",
  },
];

export const QUICK_CHIPS = [
  {
    id: "research",
    label: "Research",
    icon: Search,
    hint: "Research any topic — answers with sources",
  },
  {
    id: "create",
    label: "Create",
    icon: PenLine,
    hint: "Create content — drafts, posts, scripts, docs",
  },
  {
    id: "analyse",
    label: "Analyse",
    icon: ChartColumn,
    hint: "Analyse data or files — drop them in",
  },
  {
    id: "imagine",
    label: "Imagine",
    icon: Palette,
    hint: "Imagine anything — describe the visual",
  },
  {
    id: "solve",
    label: "Solve",
    icon: Puzzle,
    hint: "Solve a problem — step by step",
  },
];
