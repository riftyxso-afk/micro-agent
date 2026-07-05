import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, TrendingUp, GitCompare, CloudSun, Target, Flame, MessageSquare, X, Send, Brain } from 'lucide-react';
import { PREDICTIONS } from './data';
import { Prediction, PredictionFactor } from './types';

const COLORS = ['#10b981', '#eab308', '#ef4444'];

const FactorIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const icons: Record<string, React.ReactNode> = {
    'trending-up': <TrendingUp size={14} />,
    'git-compare': <GitCompare size={14} />,
    'cloud-sun': <CloudSun size={14} />,
    'target': <Target size={14} />,
    'flame': <Flame size={14} />,
  };
  return <>{icons[icon] || <TrendingUp size={14} />}</>;
};

const FactorBar: React.FC<{ factor: PredictionFactor }> = ({ factor }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <FactorIcon icon={factor.icon} />
        {factor.name}
      </div>
      <span className="text-sm font-semibold text-[#f5a623]">{factor.value}%</span>
    </div>
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#f5a623] to-[#f7c948] rounded-full transition-all duration-500"
        style={{ width: `${factor.value}%` }}
      />
    </div>
  </div>
);

const FormationVisual: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
  const { startingXI } = prediction;
  const grid: (string | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));

  startingXI.players.forEach((player) => {
    if (player.row >= 0 && player.row < 5 && player.col >= 0 && player.col < 5) {
      grid[player.row][player.col] = player.name;
    }
  });

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-green-600/20 to-green-800/20 border border-green-500/20">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-green-400">Formasi: {startingXI.formation}</span>
      </div>
      <div className="space-y-2">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2">
            {row.map((cell, colIdx) => (
              <div
                key={colIdx}
                className={`
                  w-14 h-8 flex items-center justify-center rounded-md text-[9px] font-medium
                  ${cell
                    ? 'bg-[#f5a623]/20 border border-[#f5a623]/30 text-white'
                    : 'bg-white/5 border border-white/10 text-transparent'
                  }
                `}
                title={cell || ''}
              >
                {cell ? cell.split(' ').pop() : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1">
        {startingXI.players.map((player, idx) => (
          <div key={idx} className="flex items-center justify-between text-[10px] text-gray-400 px-2">
            <span>{player.name}</span>
            <span className="text-[#f5a623]">{player.position}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatDrawer: React.FC<{ prediction: Prediction; onClose: () => void }> = ({ prediction, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: `Saya GoalMind AI. Ada yang ingin ditanyakan tentang prediksi ${prediction.homeTeam} vs ${prediction.awayTeam}?` },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Berdasarkan analisis kami, ${prediction.homeTeam} memiliki peluang ${prediction.homeWin}% untuk menang. Faktor utama yang mendukung adalah form tim dan rekor head-to-head. Apakah ada aspek spesifik yang ingin dibahas lebih lanjut?`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md h-[500px] bg-[#0a1f3f] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-[#f5a623]" />
            <span className="text-sm font-semibold text-white">Tanya AI tentang Prediksi</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-[#f5a623] text-[#0a1f3f]'
                  : 'bg-white/5 text-gray-200 border border-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pertanyaan..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f5a623]/50"
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 rounded-lg bg-[#f5a623] text-[#0a1f3f] hover:bg-[#f7c948] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PredictionPage: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState('brasil-jerman');
  const [showChat, setShowChat] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const prediction = PREDICTIONS[selectedMatch];
  const matchOptions = Object.entries(PREDICTIONS).map(([key, p]) => ({
    key,
    label: `${p.homeTeam} vs ${p.awayTeam}`,
  }));

  const pieData = [
    { name: prediction.homeTeam, value: prediction.homeWin },
    { name: 'Seri', value: prediction.draw },
    { name: prediction.awayTeam, value: prediction.awayWin },
  ];

  return (
    <div className="min-h-screen bg-[#0d1b2a] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Prediksi Pertandingan</h1>
            <p className="text-sm text-gray-400">Analisis AI berbasis data real-time</p>
          </div>

          {/* Match Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-sm">{prediction.homeTeam} vs {prediction.awayTeam}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-2 w-64 bg-[#0a1f3f] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                {matchOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelectedMatch(opt.key);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors ${
                      selectedMatch === opt.key ? 'text-[#f5a623] bg-[#f5a623]/10' : 'text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Probabilitas Hasil</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1f3f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Peluang']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-gray-300">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: COLORS[index] }}>
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Factors */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Faktor Kunci</h3>
          <div className="space-y-4">
            {prediction.factors.map((factor, idx) => (
              <FactorBar key={idx} factor={factor} />
            ))}
          </div>
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 {prediction.reasoning}
            </p>
          </div>
        </div>

        {/* Starting XI */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Starting XI Predicted</h3>
          <FormationVisual prediction={prediction} />
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#f5a623] text-[#0a1f3f] flex items-center justify-center shadow-lg shadow-[#f5a623]/25 hover:bg-[#f7c948] transition-all duration-200 hover:scale-105"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {showChat && (
        <ChatDrawer prediction={prediction} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};
