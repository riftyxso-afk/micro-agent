import React from 'react';
import { Match } from '../types';

interface LiveScoreWidgetProps {
  matches: Match[];
  isLoading?: boolean;
}

const ShimmerCard: React.FC = () => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-full" />
        <div className="w-16 h-4 bg-white/10 rounded" />
      </div>
      <div className="w-8 h-4 bg-white/10 rounded" />
      <div className="flex items-center gap-2">
        <div className="w-16 h-4 bg-white/10 rounded" />
        <div className="w-8 h-8 bg-white/10 rounded-full" />
      </div>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="w-10 h-10 bg-white/10 rounded" />
      <div className="w-16 h-8 bg-white/10 rounded" />
      <div className="w-10 h-10 bg-white/10 rounded" />
    </div>
  </div>
);

const LiveIndicator: React.FC = () => (
  <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
    LIVE
  </span>
);

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{match.homeFlag}</span>
          <span className="text-sm font-medium text-white">{match.home}</span>
        </div>
        <div className="text-xs text-gray-400">{match.minute}'</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{match.away}</span>
          <span className="text-xl">{match.awayFlag}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10">
          <span className="text-2xl font-bold text-white">{match.homeScore}</span>
        </div>
        <div className="flex flex-col items-center">
          <LiveIndicator />
          <span className="text-xs text-gray-400 mt-1">vs</span>
        </div>
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10">
          <span className="text-2xl font-bold text-white">{match.awayScore}</span>
        </div>
      </div>

      {match.goalScorers.length > 0 && (
        <div className="text-xs text-gray-400 text-center mb-2">
          ⚽ {match.goalScorers.join(' • ')}
        </div>
      )}

      {match.possession && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{match.possession.home}%</span>
            <span>Penguasaan Bola</span>
            <span>{match.possession.away}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${match.possession.home}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${match.possession.away}%` }}
            />
          </div>
        </div>
      )}

      {match.shotsOnTarget && (
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>Tembakan: {match.shotsOnTarget.home}</span>
          <span>Tembakan: {match.shotsOnTarget.away}</span>
        </div>
      )}
    </div>
  );
};

export const LiveScoreWidget: React.FC<LiveScoreWidgetProps> = ({ matches, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-white/5 border border-white/10">
        <div className="text-4xl mb-3">⚽</div>
        <p className="text-gray-400 text-sm">
          Tidak ada laga saat ini.
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Cek jadwal berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
};
