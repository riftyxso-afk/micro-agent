import React, { useState, useCallback } from 'react';
import { X, Trophy, MessageSquare, Brain, Zap, Calendar, Table2, Send, Menu, TrendingUp, Clock, Newspaper, Radio, ChevronDown, GitCompare, CloudSun, Target, Flame } from 'lucide-react';
import { LIVE_MATCHES, NEWS_ITEMS, PREDICTIONS, QUICK_ACTIONS } from './data';
import { ChatMessage, MenuId, QuickAction, Match, NewsItem, Prediction, PredictionFactor } from './types';

let messageIdCounter = 0;
const generateId = () => `msg-${++messageIdCounter}-${Date.now()}`;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Selamat datang di GoalMind AI! Tanyakan apa saja tentang Piala Dunia 2026.\n\nSaya bisa membantu Anda dengan:\n• Skor dan hasil pertandingan\n• Prediksi dan analisis\n• Jadwal pertandingan\n• Klasemen grup\n• Formasi dan taktik\n\nSilakan bertanya atau gunakan quick action di bawah!',
  timestamp: new Date(),
};

const COLORS = ['#10b981', '#eab308', '#ef4444'];

function generateAIResponse(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('skor') || lower.includes('score') || lower.includes('hasil'))
    return '🔥 Skor sementara:\n\n🇧🇷 Brasil 2 - 1 Jerman 🇩🇪\n⏱️ Menit 67\n⚽ Neymar (32\'), Vinicius (58\')\n⚽ Musiala (45+1\')\n📊 Penguasaan bola: 48% - 52%\n\n🇪🇸 Spanyol 0 - 0 Maroko 🇲🇦\n⏱️ Menit 23\n\n🇫🇷 Prancis 1 - 0 Senegal 🇸🇳\n⏱️ Menit 45\n⚽ Mbappé (38\')';
  if (lower.includes('prediksi') || lower.includes('prediction'))
    return '🧠 Prediksi Hari Ini:\n\n1. 🇧🇷 Brasil vs Jerman 🇩🇪\n   Peluang: Brasil 52% | Seri 26% | Jerman 22%\n\n2. 🇦🇷 Argentina vs Maroko 🇲🇦\n   Peluang: Argentina 55% | Seri 25% | Maroko 20%\n\n3. 🇫🇷 Prancis vs Senegal 🇸🇳\n   Peluang: Prancis 60% | Seri 22% | Senegal 18%';
  if (lower.includes('jadwal') || lower.includes('schedule'))
    return '📅 Jadwal Pertandingan Hari Ini:\n\n🕐 17:00 WIB - Brasil vs Jerman\n📍 Stadium MetLife, New York\n\n🕐 20:00 WIB - Spanyol vs Maroko\n📍 Stadium AT&T, Dallas\n\n🕐 23:00 WIB - Prancis vs Senegal\n📍 Stadium SoFi, Los Angeles';
  if (lower.includes('klasemen') || lower.includes('standing') || lower.includes('grup'))
    return '🏆 Klasemen Grup A:\n\n1. 🇳🇱 Belanda    6 pts (+3)\n2. 🇪🇨 Ekuador    3 pts (0)\n3. 🇸🇳 Senegal    3 pts (-1)\n4. 🇶🇦 Qatar       0 pts (-2)';
  return `Terima kasih atas pertanyaan Anda tentang "${query}".\n\nSebagai GoalMind AI, saya sedang menganalisis data pertandingan terkini.\n\nApakah Anda ingin bertanya tentang:\n• Skor pertandingan live\n• Prediksi hasil\n• Jadwal pertandingan\n• Klasemen grup`;
}

// ── LiveScoreWidget ──────────────────────────────────────────────────────────
const LiveScoreWidget: React.FC<{ matches: Match[] }> = ({ matches }) => {
  if (matches.length === 0)
    return (
      <div className="p-6 text-center rounded-xl bg-white/5 border border-white/10">
        <div className="text-4xl mb-3">⚽</div>
        <p className="text-gray-400 text-sm">Tidak ada laga saat ini.</p>
        <p className="text-gray-500 text-xs mt-1">Cek jadwal berikutnya.</p>
      </div>
    );
  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {matches.map((m) => (
        <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{m.homeFlag}</span>
              <span className="text-sm font-medium text-white">{m.home}</span>
            </div>
            <span className="text-xs text-gray-400">{m.minute}'</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{m.away}</span>
              <span className="text-lg">{m.awayFlag}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10">
              <span className="text-xl font-bold text-white">{m.homeScore}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                LIVE
              </span>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10">
              <span className="text-xl font-bold text-white">{m.awayScore}</span>
            </div>
          </div>
          {m.goalScorers.length > 0 && (
            <div className="text-[11px] text-gray-400 text-center mb-2">⚽ {m.goalScorers.join(' • ')}</div>
          )}
          {m.possession && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{m.possession.home}%</span>
                <span>Penguasaan</span>
                <span>{m.possession.away}%</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${m.possession.home}%` }} />
                <div className="bg-blue-500" style={{ width: `${m.possession.away}%` }} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── PredictionPanel ──────────────────────────────────────────────────────────
const PredictionPanel: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState('brasil-jerman');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const prediction = PREDICTIONS[selectedMatch];
  const matchOptions = Object.entries(PREDICTIONS).map(([key, p]) => ({ key, label: `${p.homeTeam} vs ${p.awayTeam}` }));
  const pieData = [
    { name: prediction.homeTeam, value: prediction.homeWin },
    { name: 'Seri', value: prediction.draw },
    { name: prediction.awayTeam, value: prediction.awayWin },
  ];

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-[#f5a623]" />
        <h3 className="text-sm font-semibold text-white">Prediksi Cepat</h3>
      </div>
      <div className="relative mb-3">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
          <span>{prediction.homeTeam} vs {prediction.awayTeam}</span>
          <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full mt-1 w-full bg-[#0a1f3f] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
            {matchOptions.map((opt) => (
              <button key={opt.key} onClick={() => { setSelectedMatch(opt.key); setDropdownOpen(false); }} className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors ${selectedMatch === opt.key ? 'text-[#f5a623] bg-[#f5a623]/10' : 'text-gray-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2 mb-3">
        {pieData.map((entry, idx) => (
          <div key={entry.name}>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span style={{ color: COLORS[idx] }}>{entry.name}</span>
              <span style={{ color: COLORS[idx] }}>{entry.value}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${entry.value}%`, backgroundColor: COLORS[idx] }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {prediction.factors.map((f, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-gray-400">{f.name}</span>
              <span className="text-[#f5a623]">{f.value}%</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#f5a623] to-[#f7c948] rounded-full" style={{ width: `${f.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">💡 {prediction.reasoning}</p>
    </div>
  );
};

// ── NewsWidget ───────────────────────────────────────────────────────────────
const NewsWidget: React.FC<{ items: NewsItem[] }> = ({ items }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-2 mb-3">
      <Newspaper size={16} className="text-[#f5a623]" />
      <h3 className="text-sm font-semibold text-white">Headline</h3>
    </div>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <h4 className="text-xs font-medium text-white mb-0.5 line-clamp-1">{item.title}</h4>
          <p className="text-[10px] text-gray-400 line-clamp-1">{item.summary}</p>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500"><Clock size={8} />{item.time}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── GoalMindDialog ───────────────────────────────────────────────────────────
interface GoalMindDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GoalMindDialog: React.FC<GoalMindDialogProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'predictions'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: generateAIResponse(text), timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: action.label, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: action.response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-[1400px] h-[90vh] bg-[#0d1b2a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative inset-y-0 left-0 z-50 w-60 bg-[#0a1f3f] border-r border-white/10 flex flex-col transition-transform duration-300`}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center">
                <Trophy size={18} className="text-[#0a1f3f]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">GoalMind</h1>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">AI Football</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {([
              { id: 'chat' as const, label: 'Chat Piala Dunia', icon: <MessageSquare size={16} /> },
              { id: 'predictions' as const, label: 'Prediksi', icon: <Brain size={16} /> },
            ]).map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-[#f5a623]/20 text-[#f5a623]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <span className={activeTab === item.id ? 'text-[#f5a623]' : 'text-gray-500'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-white/10">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-xs hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/25">
              <Radio size={14} className="animate-pulse" />
              Live
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-red-600 rounded-full">{LIVE_MATCHES.length}</span>
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a1f3f]/80 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
              <Menu size={18} />
            </button>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white">{activeTab === 'chat' ? 'Chat Piala Dunia' : 'Prediksi Pertandingan'}</h2>
              <p className="text-[10px] text-gray-400">AI-powered football insights</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Chat or Predictions */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeTab === 'chat' ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center mb-3 shadow-lg shadow-[#f5a623]/25">
                          <Brain size={28} className="text-[#0a1f3f]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Selamat datang di GoalMind AI!</h3>
                        <p className="text-gray-400 max-w-sm text-xs">Tanyakan apa saja tentang Piala Dunia 2026.</p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-[#f5a623] text-[#0a1f3f]' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center">
                                <Brain size={10} className="text-[#0a1f3f]" />
                              </div>
                              <span className="text-[10px] font-semibold text-[#f5a623]">GoalMind AI</span>
                            </div>
                          )}
                          <div className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Quick Actions */}
                  <div className="px-4 py-2 border-t border-white/5">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {QUICK_ACTIONS.map((action) => {
                        const iconMap: Record<string, React.ReactNode> = { zap: <Zap size={12} />, brain: <Brain size={12} />, calendar: <Calendar size={12} />, table: <Table2 size={12} /> };
                        return (
                          <button key={action.id} onClick={() => handleQuickAction(action)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300 hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30 hover:text-[#f5a623] transition-all duration-200 whitespace-nowrap">
                            {iconMap[action.icon] || <Zap size={12} />}
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Input */}
                  <div className="p-3 border-t border-white/10 bg-[#0a1f3f]/50">
                    <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSendMessage(input.trim()); }} className="flex gap-2">
                      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanyakan tentang Piala Dunia..." className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#f5a623]/50 transition-all" />
                      <button type="submit" disabled={!input.trim()} className="px-3 py-2.5 rounded-lg bg-[#f5a623] text-[#0a1f3f] font-semibold hover:bg-[#f7c948] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <PredictionFullPage />
                </div>
              )}
            </div>

            {/* Right Panel */}
            <aside className="hidden lg:flex flex-col w-[300px] border-l border-white/10 bg-[#0a1f3f]/50 overflow-y-auto">
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  <h3 className="text-xs font-semibold text-white">Live Score</h3>
                  <span className="ml-auto text-[9px] text-gray-400">{LIVE_MATCHES.length} laga</span>
                </div>
                <LiveScoreWidget matches={LIVE_MATCHES} />
              </div>
              <div className="p-3 border-b border-white/10">
                <PredictionPanel />
              </div>
              <div className="p-3">
                <NewsWidget items={NEWS_ITEMS} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Full Prediction Page (for tab) ───────────────────────────────────────────
const PredictionFullPage: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState('brasil-jerman');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const prediction = PREDICTIONS[selectedMatch];
  const matchOptions = Object.entries(PREDICTIONS).map(([key, p]) => ({ key, label: `${p.homeTeam} vs ${p.awayTeam}` }));
  const pieData = [
    { name: prediction.homeTeam, value: prediction.homeWin },
    { name: 'Seri', value: prediction.draw },
    { name: prediction.awayTeam, value: prediction.awayWin },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Prediksi Pertandingan</h2>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-colors">
            {prediction.homeTeam} vs {prediction.awayTeam}
            <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-1 right-0 w-56 bg-[#0a1f3f] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
              {matchOptions.map((opt) => (
                <button key={opt.key} onClick={() => { setSelectedMatch(opt.key); setDropdownOpen(false); }} className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors ${selectedMatch === opt.key ? 'text-[#f5a623] bg-[#f5a623]/10' : 'text-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pie */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-xs font-semibold text-white mb-3">Probabilitas Hasil</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-40 h-40">
              {(() => {
                let acc = 0;
                return pieData.map((entry, i) => {
                  const dashArray = (entry.value / 100) * 314;
                  const dashOffset = -acc * 3.14;
                  acc += entry.value;
                  return <circle key={i} cx="50" cy="50" r="50" fill="none" stroke={COLORS[i]} strokeWidth="20" strokeDasharray={`${dashArray} ${314 - dashArray}`} strokeDashoffset={dashOffset} />;
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{prediction.homeWin}%</div>
                <div className="text-[10px] text-gray-400">{prediction.homeTeam}</div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-[11px] text-gray-300">{entry.name}</span>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: COLORS[idx] }}>{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Factors */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-xs font-semibold text-white mb-3">Faktor Kunci</h3>
          <div className="space-y-3">
            {prediction.factors.map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-300">{f.name}</span>
                  <span className="text-[#f5a623] font-semibold">{f.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f5a623] to-[#f7c948] rounded-full" style={{ width: `${f.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">💡 {prediction.reasoning}</p>
        </div>
        {/* Formation */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-xs font-semibold text-white mb-3">Starting XI ({prediction.startingXI.formation})</h3>
          <div className="p-3 rounded-lg bg-gradient-to-b from-green-600/20 to-green-800/20 border border-green-500/20">
            {(() => {
              const grid: (string | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
              prediction.startingXI.players.forEach((p) => { grid[p.row][p.col] = p.name; });
              return grid.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-1.5 mb-1.5">
                  {row.map((cell, ci) => (
                    <div key={ci} className={`w-12 h-6 flex items-center justify-center rounded text-[8px] font-medium ${cell ? 'bg-[#f5a623]/20 border border-[#f5a623]/30 text-white' : 'bg-white/5 border border-white/10 text-transparent'}`}>
                      {cell ? cell.split(' ').pop() : ''}
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
            {prediction.startingXI.players.map((p, i) => (
              <div key={i} className="flex justify-between text-[9px]">
                <span className="text-gray-400">{p.name}</span>
                <span className="text-[#f5a623]">{p.position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
