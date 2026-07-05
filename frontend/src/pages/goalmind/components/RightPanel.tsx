import React from 'react';
import { TrendingUp, Clock, Newspaper } from 'lucide-react';
import { LiveScoreWidget } from './LiveScoreWidget';
import { Match, NewsItem } from '../types';

interface RightPanelProps {
  liveMatches: Match[];
  newsItems: NewsItem[];
}

const PredictionQuick: React.FC = () => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-2 mb-3">
      <TrendingUp size={16} className="text-[#f5a623]" />
      <h3 className="text-sm font-semibold text-white">Prediksi Cepat</h3>
    </div>

    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇦🇷</span>
          <span className="text-sm font-medium text-white">Argentina</span>
        </div>
        <span className="text-xs text-gray-400">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Maroko</span>
          <span className="text-lg">🇲🇦</span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-400">Argentina</span>
            <span className="text-emerald-400">55%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '55%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-yellow-400">Seri</span>
            <span className="text-yellow-400">25%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">Maroko</span>
            <span className="text-red-400">20%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '20%' }} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
        💡 Argentina dalam performa terbaik setelah juara Piala Dunia 2022. Messi masih menjadi pembeda utama.
      </p>
    </div>
  </div>
);

const NewsWidget: React.FC<{ items: NewsItem[] }> = ({ items }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-2 mb-3">
      <Newspaper size={16} className="text-[#f5a623]" />
      <h3 className="text-sm font-semibold text-white">Headline Piala Dunia</h3>
    </div>

    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
        >
          <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">{item.title}</h4>
          <p className="text-xs text-gray-400 line-clamp-2">{item.summary}</p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
            <Clock size={10} />
            {item.time}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RightPanel: React.FC<RightPanelProps> = ({ liveMatches, newsItems }) => {
  return (
    <aside className="hidden xl:flex flex-col w-[360px] border-l border-white/10 bg-[#0a1f3f]/80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* Live Scores */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <h3 className="text-sm font-semibold text-white">Live Score</h3>
          <span className="ml-auto text-[10px] text-gray-400">{liveMatches.length} laga</span>
        </div>
        <LiveScoreWidget matches={liveMatches} />
      </div>

      {/* Quick Prediction */}
      <div className="p-4 border-b border-white/10">
        <PredictionQuick />
      </div>

      {/* News */}
      <div className="p-4">
        <NewsWidget items={newsItems} />
      </div>
    </aside>
  );
};
