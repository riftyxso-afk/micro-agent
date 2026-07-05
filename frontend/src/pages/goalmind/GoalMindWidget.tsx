import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Radio, TrendingUp, ChevronRight, ChevronDown,
  Zap, Brain, Calendar, Table2, MessageSquare, Clock, Newspaper, Send,
  X, RefreshCw, Wifi, WifiOff,
} from "lucide-react";
import { QUICK_ACTIONS } from "./data";
import type { QuickAction, ChatMessage } from "./types";
import {
  fetchLiveScores,
  fetchFootballNews,
  sendChatMessage,
  getQuickActionResponse,
} from "./services";
import type { LiveMatch, NewsItem } from "./services";

/* ── Live Match Card ────────────────────────────────────────────────────── */
const LiveCard: React.FC<{ match: LiveMatch }> = ({ match }) => (
  <div className="flex-shrink-0 w-[220px] p-3 rounded-xl bg-gradient-to-br from-[#0a1f3f] to-[#0d2444] border border-white/10 hover:border-[#f5a623]/30 transition-all duration-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{match.homeFlag}</span>
        <span className="text-[11px] font-medium text-white">{match.home}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <span className="text-[9px] font-bold text-red-400">{match.minute}'</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-white">{match.away}</span>
        <span className="text-sm">{match.awayFlag}</span>
      </div>
    </div>
    <div className="flex items-center justify-center gap-3">
      <span className="text-xl font-bold text-white">{match.homeScore}</span>
      <span className="text-[10px] text-gray-500">-</span>
      <span className="text-xl font-bold text-white">{match.awayScore}</span>
    </div>
    {match.goalScorers.length > 0 && (
      <div className="mt-1.5 text-[9px] text-gray-400 text-center truncate">
        ⚽ {match.goalScorers.join(" • ")}
      </div>
    )}
    {match.possession && (
      <div className="mt-2">
        <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
          <span>{match.possession.home}%</span>
          <span>{match.possession.away}%</span>
        </div>
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500" style={{ width: `${match.possession.home}%` }} />
          <div className="bg-blue-500" style={{ width: `${match.possession.away}%` }} />
        </div>
      </div>
    )}
  </div>
);

/* ── Quick Action Button ────────────────────────────────────────────────── */
const QuickActionBtn: React.FC<{ action: QuickAction; onClick: () => void }> = ({ action, onClick }) => {
  const icons: Record<string, React.ReactNode> = {
    zap: <Zap size={12} />,
    brain: <Brain size={12} />,
    calendar: <Calendar size={12} />,
    table: <Table2 size={12} />,
  };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-[#0a1f3f] hover:text-white hover:border-[#0a1f3f] transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      {icons[action.icon] || <Zap size={12} />}
      {action.label}
    </button>
  );
};

/* ── Loading Skeleton ───────────────────────────────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="flex-shrink-0 w-[220px] p-3 rounded-xl bg-white/5 border border-white/10 animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="w-16 h-3 bg-white/10 rounded" />
      <div className="w-8 h-3 bg-white/10 rounded" />
      <div className="w-16 h-3 bg-white/10 rounded" />
    </div>
    <div className="flex justify-center gap-3">
      <div className="w-8 h-8 bg-white/10 rounded" />
      <div className="w-8 h-8 bg-white/10 rounded" />
    </div>
  </div>
);

/* ── GoalMindWidget ─────────────────────────────────────────────────────── */
export const GoalMindWidget: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Selamat datang di GoalMind AI! Tanyakan apa saja tentang Piala Dunia 2026. ⚽\n\nGunakan quick action di bawah untuk jawaban cepat, atau ketik pertanyaan Anda.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // ── Fetch Data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [matches, newsItems] = await Promise.allSettled([
        fetchLiveScores(),
        fetchFootballNews(),
      ]);

      if (matches.status === "fulfilled") setLiveMatches(matches.value);
      if (newsItems.status === "fulfilled") setNews(newsItems.value);

      setConnected(true);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Chat Handlers ───────────────────────────────────────────────────────
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: action.label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const response = await sendChatMessage([
        { role: "user", content: action.label },
      ]);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Use local response
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: getQuickActionResponse(action.id),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    try {
      const response = await sendChatMessage(
        messages.concat(userMsg).map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi atau gunakan quick action.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  }, [input, messages, chatLoading]);

  return (
    <>
      {/* ── Main Widget Card ──────────────────────────────────────────── */}
      <div className="w-full max-w-[680px] mx-auto mt-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header (clickable toggle) */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#0a1f3f] to-[#0d2444] hover:from-[#0d2444] hover:to-[#0f2a4e] transition-colors duration-150"
            aria-expanded={isExpanded}
            data-testid="goalmind-toggle"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center flex-shrink-0">
              <Trophy size={14} className="text-[#0a1f3f]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xs font-bold text-white">GoalMind</h3>
              <p className="text-[9px] text-gray-400">Piala Dunia 2026 • AI Insights</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                connected === true
                  ? "bg-green-500/10 border border-green-500/20"
                  : connected === false
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : "bg-gray-500/10 border border-gray-500/20"
              }`}>
                {connected === true ? (
                  <Wifi size={10} className="text-green-400" />
                ) : connected === false ? (
                  <WifiOff size={10} className="text-yellow-400" />
                ) : (
                  <RefreshCw size={10} className="text-gray-400 animate-spin" />
                )}
                <span className={`text-[9px] font-semibold ${
                  connected === true ? "text-green-400" : connected === false ? "text-yellow-400" : "text-gray-400"
                }`}>
                  {connected === true ? "Live" : connected === false ? "Offline" : "Loading"}
                </span>
              </div>
              {/* Live Count */}
              {isExpanded && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <Radio size={10} className="text-red-400 animate-pulse" />
                  <span className="text-[9px] font-semibold text-red-400">{liveMatches.length} LIVE</span>
                </div>
              )}
              {/* Refresh */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fetchData(); }}
                disabled={loading}
                className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
              {/* Chevron */}
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* ── Collapsible Content ──────────────────────────────── */}
          <div className={`ma-collapse ${isExpanded ? "ma-collapse-open" : ""}`} aria-hidden={!isExpanded}>
            <div className="overflow-hidden">
              {/* Live Matches Horizontal Scroll */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Live Now</span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : liveMatches.length > 0 ? (
                    liveMatches.map((m) => (
                      <LiveCard key={m.id} match={m} />
                    ))
                  ) : (
                    <div className="w-full py-4 text-center">
                      <p className="text-[11px] text-gray-400">⚽ Tidak ada pertandingan live saat ini</p>
                      <p className="text-[9px] text-gray-300 mt-1">Cek jadwal berikutnya</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions + Prediction Row */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap size={12} className="text-[#f5a623]" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {QUICK_ACTIONS.map((a) => (
                    <QuickActionBtn key={a.id} action={a} onClick={() => handleQuickAction(a)} />
                  ))}
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a1f3f] text-white text-[11px] font-medium hover:bg-[#0d2444] transition-all duration-200 shadow-sm"
                  >
                    <MessageSquare size={12} />
                    Tanya AI
                  </button>
                </div>

                {/* Inline Prediction Mini */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp size={12} className="text-[#f5a623]" />
                      <span className="text-[10px] font-semibold text-gray-700">Prediksi Cepat</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-gray-600">🇦🇷 Argentina vs 🇲🇦 Maroko</span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      <div className="flex-1 bg-emerald-400 rounded-full" title="Argentina 55%" />
                      <div className="w-[25%] bg-yellow-400 rounded-full" title="Seri 25%" />
                      <div className="w-[20%] bg-red-400 rounded-full" title="Maroko 20%" />
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-400 mt-0.5">
                      <span>ARG 55%</span>
                      <span>SERI 25%</span>
                      <span>MAR 20%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Headlines */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Newspaper size={12} className="text-[#f5a623]" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Headline {connected === false && <span className="text-yellow-500">(Offline)</span>}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {loading ? (
                    <>
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    </>
                  ) : news.length > 0 ? (
                    news.slice(0, 2).map((n) => (
                      <a
                        key={n.id}
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="w-1 h-1 rounded-full bg-[#f5a623] mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-gray-800 group-hover:text-[#0a1f3f] truncate">{n.title}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{n.source} • {formatTimeAgo(n.publishedAt)}</p>
                        </div>
                        <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 mt-0.5 flex-shrink-0" />
                      </a>
                    ))
                  ) : (
                    <div className="py-3 text-center">
                      <p className="text-[11px] text-gray-400">📰 Tidak ada berita tersedia</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline Chat Drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full max-w-[680px] mx-auto mt-3 overflow-hidden"
          >
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-[#0a1f3f] to-[#0d2444]">
                <Brain size={14} className="text-[#f5a623]" />
                <span className="text-[11px] font-semibold text-white flex-1">GoalMind AI Chat</span>
                {connected === false && (
                  <span className="text-[9px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">Offline Mode</span>
                )}
                <button onClick={() => setChatOpen(false)} className="p-1 rounded-md hover:bg-white/10 text-gray-400">
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div className="max-h-[200px] overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#0a1f3f] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl bg-gray-100 text-[11px] text-gray-500">
                      <span className="animate-pulse">Berpikir...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan tentang Piala Dunia..."
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f5a623]/50 focus:ring-1 focus:ring-[#f5a623]/20 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatLoading}
                  className="p-2 rounded-lg bg-[#0a1f3f] text-white hover:bg-[#0d2444] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins}m lalu`;
  if (diffHours < 24) return `${diffHours}j lalu`;
  return `${diffDays}h lalu`;
}
