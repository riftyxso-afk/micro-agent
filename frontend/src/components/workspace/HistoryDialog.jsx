import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  History,
  Clock,
  MessageSquare,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getModelById } from "@/lib/workspaceData";
import { ModelIcon } from "@/components/workspace/ModelIcon";

const MOCK_HISTORY = [
  { prompt: "Create an iOS Dynamic Island component in HTML", modelId: "deepseek-v4-pro", date: "Today, 10:32 AM" },
  { prompt: "Explain Bayes' theorem like I'm 15", modelId: "deepseek-v4-pro", date: "Today, 9:15 AM" },
  { prompt: "Build a REST API with FastAPI", modelId: "deepseek-v4-pro", date: "Yesterday, 4:50 PM" },
  { prompt: "Summarize the latest EV battery breakthroughs", modelId: "deepseek-v4-pro", date: "Yesterday, 2:10 PM" },
  { prompt: "Create a landing page with hero section", modelId: "deepseek-v4-pro", date: "Jun 12, 2026" },
  { prompt: "Debug authentication flow in Next.js app", modelId: "deepseek-v4-pro", date: "Jun 11, 2026" },
  { prompt: "Write a product launch announcement email", modelId: "deepseek-v4-pro", date: "Jun 10, 2026" },
  { prompt: "Compare React vs Vue for SaaS dashboard", modelId: "deepseek-v4-pro", date: "Jun 9, 2026" },
  { prompt: "What drove the revenue change in Q3?", modelId: "deepseek-v4-pro", date: "Jun 8, 2026" },
  { prompt: "Compare four-day workweek studies", modelId: "deepseek-v4-pro", date: "Jun 7, 2026" },
  { prompt: "Analyze this CSV sales data and find trends", modelId: "deepseek-v4-pro", date: "Jun 5, 2026" },
  { prompt: "Design a meditation app home screen", modelId: "deepseek-v4-pro", date: "Jun 3, 2026" },
];

export const HistoryDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_HISTORY;
    return MOCK_HISTORY.filter((item) =>
      item.prompt.toLowerCase().includes(q),
    );
  }, [query]);

  const openChat = (item) => {
    onOpenChange(false);
    setQuery("");
    navigate("/chat", {
      state: { prompt: item.prompt, modelId: item.modelId },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setQuery(""); onOpenChange(v); }}>
      <DialogContent
        data-testid="history-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F4F6FB] text-[#4D6BFE]">
            <History size={17} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold text-[#111111]">
              History
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              {MOCK_HISTORY.length} conversations
            </DialogDescription>
          </div>
        </div>

        <div className="border-b border-[#F0F1F3] px-5 py-3">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.75}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              data-testid="history-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="ma-focus h-9 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-8 text-sm text-[#111111] placeholder:text-[#9CA3AF]"
            />
            {query && (
              <button
                type="button"
                data-testid="history-search-clear"
                onClick={() => setQuery("")}
                className="ma-focus absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]"
              >
                <X size={12} strokeWidth={2} />
              </button>
            )}
          </div>
          {query && (
            <p className="mt-2 text-[11px] text-[#9CA3AF]">
              {filtered.length} result{filtered.length !== 1 && "s"}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Search size={20} strokeWidth={1.75} className="text-[#D1D5DB]" />
              <p className="text-sm text-[#9CA3AF]">No conversations match "{query}"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const model = getModelById(item.modelId);
              return (
                <button
                  key={`${item.date}-${idx}`}
                  type="button"
                  data-testid={`history-item-${idx}`}
                  onClick={() => openChat(item)}
                  className="ma-focus flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.99]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#F0F1F3] bg-white">
                    <MessageSquare size={15} strokeWidth={1.75} className="text-[#6B7280]" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-[#111111]">
                      {item.prompt}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <ModelIcon model={model} size={16} />
                        {model.shortName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} strokeWidth={1.75} />
                        {item.date}
                      </span>
                    </span>
                  </span>
                  <ChevronRight size={15} strokeWidth={1.75} className="shrink-0 text-[#D1D5DB]" />
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
