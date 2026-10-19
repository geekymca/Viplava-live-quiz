import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Users, Crown, Radio } from 'lucide-react';
import { sounds } from '../audio/soundEffects.ts';

interface NavbarProps {
  currentTab: 'host' | 'player';
  onSelectTab: (tab: 'host' | 'player') => void;
  roomCode?: string;
  isLive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  roomCode,
  isLive,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const handleToggleSound = () => {
    const nextState = sounds.toggle();
    setSoundEnabled(nextState);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0718]/90 backdrop-blur-md border-b border-amber-500/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Devotional Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#120a20] rounded-[14px] flex items-center justify-center text-amber-300 text-lg">
              🪷
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                Gokul Mathura Dham
              </span>
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-black tracking-wide uppercase">
                Srila Prabhupada ISKCON Quiz
              </span>
            </div>
            <p className="text-[11px] text-amber-200/70 hidden sm:block font-medium">
              Live Vedic Multiplayer Arena • 1,000+ Contenders Synchronized
            </p>
          </div>
        </div>

        {/* Center Mode Switch Tabs */}
        <div className="flex items-center bg-[#170e28] border border-amber-500/30 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => onSelectTab('player')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'player'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Join as Sevak / Player</span>
          </button>
          <button
            onClick={() => onSelectTab('host')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'host'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Host / Yajna Acharya</span>
          </button>
        </div>

        {/* Right Tools (Active Room Badge, Sound Toggle) */}
        <div className="flex items-center gap-2.5">
          {roomCode && (
            <div className="hidden md:flex items-center gap-2 bg-[#170e28] border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] text-amber-200/80 uppercase font-semibold">Dham PIN:</span>
              <span className="font-mono font-black text-amber-300 text-xs tracking-wider">
                {roomCode}
              </span>
            </div>
          )}

          {/* Temple Bell Audio FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              soundEnabled
                ? 'bg-[#170e28] border-amber-500/40 text-amber-300 hover:bg-[#201438]'
                : 'bg-[#170e28] border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute temple bell sound effects' : 'Enable temple bell sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline text-[11px]">{soundEnabled ? 'Temple Bells' : 'Muted'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
