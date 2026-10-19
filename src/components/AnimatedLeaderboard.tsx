import React, { useState } from 'react';
import { LeaderboardEntry } from '../types.ts';
import { Trophy, TrendingUp, TrendingDown, Minus, Flame, Search, Medal, Sparkles } from 'lucide-react';

interface AnimatedLeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  title?: string;
  isFinal?: boolean;
}

export const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({
  entries,
  currentPlayerId,
  title = 'Live Dham Standings',
  isFinal = false,
}) => {
  const [search, setSearch] = useState('');

  const filtered = entries.filter((e) =>
    (e.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const displayList = search ? filtered : entries.slice(0, 15);
  const currentPlayer = entries.find((e) => e.id === currentPlayerId);
  const isCurrentPlayerInTop = displayList.some((e) => e.id === currentPlayerId);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#140b22]/90 border border-amber-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 text-lg">
            {isFinal ? '👑' : '🪷'}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-amber-100 flex items-center gap-2">
              {title}
              {isFinal && (
                <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Maha-Final
                </span>
              )}
            </h2>
            <p className="text-xs text-amber-200/70">
              {entries.length.toLocaleString()} Vaishnavas offering answers in Gokul Dham
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search devotees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0714] border border-amber-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-700/60 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Animated Rows List */}
      <div className="space-y-2 relative">
        {displayList.map((entry) => {
          const isUser = entry.id === currentPlayerId;
          const delta = (entry.prevRank || entry.rank) - entry.rank;

          const isGold = entry.rank === 1;
          const isSilver = entry.rank === 2;
          const isBronze = entry.rank === 3;

          const borderStyle = isUser
            ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/40'
            : isGold
            ? 'border-amber-400/80 bg-gradient-to-r from-amber-950/40 via-[#1a0e2d] to-[#140b22]'
            : isSilver
            ? 'border-slate-300/60 bg-gradient-to-r from-slate-900/40 via-[#1a0e2d] to-[#140b22]'
            : isBronze
            ? 'border-amber-700/60 bg-gradient-to-r from-amber-950/30 via-[#1a0e2d] to-[#140b22]'
            : 'border-amber-950/50 bg-[#140b22]/80';

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-500 ease-out transform ${borderStyle} hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                    isGold
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950'
                      : isSilver
                      ? 'bg-slate-300 text-slate-950'
                      : isBronze
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#201438] text-amber-200'
                  }`}
                >
                  #{entry.rank}
                </div>

                {/* Rank Delta Mover */}
                <div className="w-12 flex items-center gap-0.5 text-xs font-bold shrink-0">
                  {delta > 0 ? (
                    <span className="flex items-center text-emerald-400 animate-bounce-subtle">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{delta}
                    </span>
                  ) : delta < 0 ? (
                    <span className="flex items-center text-rose-400">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {delta}
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-500/50">
                      <Minus className="w-3 h-3 mr-0.5" />0
                    </span>
                  )}
                </div>

                {/* Avatar & Devotee Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0 p-1 bg-[#0c0714] rounded-lg border border-amber-500/20">
                    {entry.avatar || '🪷'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-amber-50 truncate">
                        {entry.fullName}
                      </span>
                      {isUser && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          YOU
                        </span>
                      )}
                      {entry.streak >= 2 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold">
                          <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {entry.streak} streak
                        </span>
                      )}
                    </div>
                    {entry.lastPointsEarned > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        +{entry.lastPointsEarned.toLocaleString()} on last shastra
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Total */}
              <div className="flex flex-col items-end shrink-0 pl-3">
                <span className="text-base sm:text-lg font-black font-mono text-amber-300">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-400/70 uppercase tracking-wider font-semibold">
                  PTS
                </span>
              </div>
            </div>
          );
        })}

        {displayList.length === 0 && (
          <div className="text-center py-10 bg-[#140b22]/50 rounded-2xl border border-dashed border-amber-500/30 text-amber-300/60 text-sm">
            No devotees found matching &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Current User if not in Top Display */}
      {currentPlayer && !isCurrentPlayerInTop && !search && (
        <div className="sticky bottom-4 z-20 bg-gradient-to-r from-amber-950/95 via-[#1a0e2d]/95 to-amber-950/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
              #{currentPlayer.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentPlayer.avatar}</span>
                <span className="font-bold text-sm text-amber-100">{currentPlayer.fullName} (You)</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Dham Standing
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Out of {entries.length.toLocaleString()} total devotees
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black font-mono text-amber-300">
              {currentPlayer.score.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400/80 uppercase font-semibold">PTS</span>
          </div>
        </div>
      )}
    </div>
  );
};
