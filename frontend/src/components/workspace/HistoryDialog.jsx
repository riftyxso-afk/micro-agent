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
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getModelById } from "@/lib/workspaceData";
import { ModelIcon } from "@/components/workspace/ModelIcon";

const MOCK_HISTORY = [
  { prompt: "Create an iOS Dynamic Island component in HTML", modelId: "deepseek-v4-pro", date: "Today, 10:32 AM" },
  { prompt: "Explain Bayes' theorem like I'm 15", modelId: "kimi-k2-6", date: "Today, 9:15 AM" },
  { prompt: "Write a launch thread for my new app", modelId: "gemini-2-5-flash-lite", date: "Yesterday, 4:50 PM" },
  { prompt: "Summarize the latest EV battery breakthroughs", modelId: "grok-4-3", date: "Yesterday, 2:10 PM" },
  { prompt: "Build a Dynamic Island component in HTML", modelId: "deepseek-v4-pro", date: "Jun 9, 2026" },
  { prompt: "What drove the revenue change in Q3?", modelId: "gemini-3-1-pro", date: "Jun 8, 2026" },
  { prompt: "Compare four-day workweek studies", modelId: "claude-haiku-4-5", date: "Jun 7, 2026" },
];

export const HistoryDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const openChat = (item) => {
    onOpenChange(false);
    navigate("/chat", {
      state: { prompt: item.prompt, modelId: item.modelId },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="history-dialog"
        className="left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-[#E5E7EB] bg-[#FCFCFD] p-0 sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-5 pb-4 pt-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F4F6FB] text-[#4D6BFE]">
            <History size={17} strokeWidth={1.75} />
          </span>
          <div>
            <DialogTitle className="text-base font-semibold text-[#111111]">
              History
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              Your recent conversations
            </DialogDescription>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {MOCK_HISTORY.map((item, idx) => {
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
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
