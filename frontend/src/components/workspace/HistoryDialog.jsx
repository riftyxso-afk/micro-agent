import { useState, useMemo, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/workspaceData";
import { ModelIcon } from "@/components/workspace/ModelIcon";
import { useAuth } from "@/lib/AuthContext";
import { fetchSessions, isSupabaseEnabled } from "@/lib/supabase";

export const HistoryDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!isSupabaseEnabled || !user) { setSessions([]); return; }
    setLoading(true);
    fetchSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [open, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title?.toLowerCase().includes(q));
  }, [query, sessions]);

  const openChat = (session) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/chat/${session.id}`);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate()) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diff < 172800000) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
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
            <DialogTitle className="text-base font-semibold text-[#111111]">History</DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[#6B7280]">
              {loading ? "Loading..." : `${sessions.length} conversation${sessions.length !== 1 ? "s" : ""}`}
            </DialogDescription>
          </div>
        </div>

        <div className="border-b border-[#F0F1F3] px-5 py-3">
          <div className="relative">
            <Search size={15} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              data-testid="history-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="ma-focus h-9 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-8 text-sm text-[#111111] placeholder:text-[#9CA3AF]"
            />
            {query && (
              <button type="button" data-testid="history-search-clear" onClick={() => setQuery("")}
                className="ma-focus absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F7F7F8] hover:text-[#111111]">
                <X size={12} strokeWidth={2} />
              </button>
            )}
          </div>
          {query && <p className="mt-2 text-[11px] text-[#9CA3AF]">{filtered.length} result{filtered.length !== 1 && "s"}</p>}
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#D1D5DB]" />
            </div>
          ) : !user || !isSupabaseEnabled ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <History size={20} strokeWidth={1.75} className="text-[#D1D5DB]" />
              <p className="text-sm text-[#9CA3AF]">Sign in to see your chat history</p>
              <button onClick={() => { onOpenChange(false); navigate("/auth"); }}
                className="mt-1 text-sm font-medium text-[#3B6EF6] hover:underline">Sign in</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Search size={20} strokeWidth={1.75} className="text-[#D1D5DB]" />
              <p className="text-sm text-[#9CA3AF]">
                {query ? `No conversations match "${query}"` : "No conversations yet"}
              </p>
            </div>
          ) : (
            filtered.map((session, idx) => {
              const model = getModelById(session.model_id || DEFAULT_MODEL_ID);
              return (
                <button key={session.id} type="button" data-testid={`history-item-${idx}`}
                  onClick={() => openChat(session)}
                  className="ma-focus flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-150 ease-out hover:bg-[#F7F7F8] active:scale-[0.99]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#F0F1F3] bg-white">
                    <MessageSquare size={15} strokeWidth={1.75} className="text-[#6B7280]" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-[#111111]">{session.title || "Untitled"}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <ModelIcon model={model} size={16} />
                        {model.shortName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} strokeWidth={1.75} />
                        {formatDate(session.updated_at)}
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
