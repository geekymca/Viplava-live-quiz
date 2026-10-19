import React, { useState } from 'react';
import { ViplavaEmblem } from './ViplavaEmblem.tsx';
import { PrabhupadaHeroArt } from './PrabhupadaHeroArt.tsx';
import { sounds } from '../audio/soundEffects.ts';
import {
  Menu,
  X,
  User,
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  Zap,
  Bell,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';

interface ViplavaLandingPageProps {
  onEnterQuiz: () => void;
  onOpenAdmin: () => void;
}

export const ViplavaLandingPage: React.FC<ViplavaLandingPageProps> = ({
  onEnterQuiz,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#071329] text-[#FFF4D8] overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-[#071329]/90 backdrop-blur-md border-b border-[#E8B957]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Mobile Hamburger / Left Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#E8B957] hover:bg-[#21153D]/60 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center Viplava Golden Emblem */}
        <ViplavaEmblem size="sm" showSubtitle={true} className="cursor-pointer" />

        {/* Right Admin Access Button */}
        <button
          onClick={() => {
            sounds.playDing();
            onOpenAdmin();
          }}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#21153D]/80 hover:bg-[#2e1d52] border border-[#E8B957]/40 text-[#FFF4D8] text-xs font-bold transition-all shadow-sm"
        >
          <User className="w-3.5 h-3.5 text-[#E8B957]" />
          <span>Admin</span>
        </button>
      </nav>

      {/* Flyout Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pt-16 animate-fade-in sm:hidden">
          <div className="bg-[#0e1a38] border-b border-[#E8B957]/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8B957]/20 pb-4">
              <span className="font-['Cinzel',serif] text-sm font-bold text-[#E8B957]">
                VIPLAVA 2026 EVENT
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-[#FFF4D8]" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterQuiz();
                }}
                className="w-full text-left py-2 font-bold text-[#E8B957] flex items-center justify-between"
              >
                <span>Join Live Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full text-left py-2 font-medium text-[#FFF4D8]/90 flex items-center justify-between"
              >
                <span>Admin Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="pt-2 border-t border-[#E8B957]/15 text-xs text-[#FFF4D8]/60 space-y-1">
                <p>ISKCON Youth Forum & Educational Outreach</p>
                <p>Gokul, Mathura & Vrindavan Dham Festival</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CINEMATIC HERO SECTION */}
      <section className="relative w-full overflow-hidden border-b border-[#E8B957]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[660px]">
          {/* Left Text & Call to Action (7 Cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-16 space-y-6 z-10">
            {/* Spiritual Pill Subtitle */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8B957] animate-pulse" />
              <span className="text-xs sm:text-sm font-['Cinzel',serif] tracking-[0.2em] uppercase font-bold text-[#E8B957]">
                A Quiz on the Life, Teachings and Legacy of
              </span>
            </div>

            {/* Majestic Title */}
            <h1 className="font-['Cinzel',serif] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#FFF4D8] leading-[1.12]">
              SRILA{' '}
              <span className="bg-gradient-to-r from-[#FFF4D8] via-[#E8B957] to-[#F39B37] bg-clip-text text-transparent">
                PRABHUPADA
              </span>
            </h1>

            {/* Sacred Motto */}
            <div className="flex items-center gap-3 text-xs sm:text-sm tracking-[0.25em] font-['Cinzel',serif] uppercase text-[#E8B957]/90 font-bold">
              <span>HIS VISION</span>
              <span>•</span>
              <span>HIS MISSION</span>
              <span>•</span>
              <span>OUR INSPIRATION</span>
            </div>

            {/* Sacred Quote */}
            <blockquote className="font-['Playfair_Display',serif] italic text-base sm:text-xl text-[#FFF4D8]/90 max-w-xl border-l-2 border-[#E8B957]/50 pl-4 py-1">
              &ldquo;Let us try to understand Srila Prabhupada&apos;s mission and carry it forward.&rdquo;
            </blockquote>

            {/* Prominent Gold Enter Quiz Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  sounds.playWhoosh();
                  onEnterQuiz();
                }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-['Plus_Jakarta_Sans',sans-serif] font-black text-base sm:text-lg shadow-[0_10px_30px_rgba(232,185,87,0.35)] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Quiz</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <p className="text-xs text-[#FFF4D8]/70 flex items-center gap-1.5 pt-1">
                <Users className="w-3.5 h-3.5 text-[#E8B957]" />
                <span>Open to all Viplava 2026 participants</span>
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E8B957]/20 max-w-lg">
              <div className="bg-[#121f3a]/60 border border-[#E8B957]/25 rounded-2xl p-3 text-center space-y-1">
                <BookOpen className="w-5 h-5 text-[#E8B957] mx-auto" />
                <p className="text-[11px] font-bold text-[#FFF4D8]">Test your knowledge</p>
              </div>
              <div className="bg-[#121f3a]/60 border border-[#E8B957]/25 rounded-2xl p-3 text-center space-y-1">
                <Sparkles className="w-5 h-5 text-[#E8B957] mx-auto" />
                <p className="text-[11px] font-bold text-[#FFF4D8]">Relive inspiring moments</p>
              </div>
              <div className="bg-[#121f3a]/60 border border-[#E8B957]/25 rounded-2xl p-3 text-center space-y-1">
                <Users className="w-5 h-5 text-[#E8B957] mx-auto" />
                <p className="text-[11px] font-bold text-[#FFF4D8]">Compete & learn together</p>
              </div>
            </div>
          </div>

          {/* Right Hero Artwork (5 Cols on Desktop) */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-4 lg:p-0">
            <PrabhupadaHeroArt className="w-full max-w-lg" />
          </div>
        </div>
      </section>

      {/* QUIZ ROUNDS SECTION */}
      <section className="relative w-full py-16 px-4 sm:px-8 bg-gradient-to-b from-[#071329] via-[#0d1c3a] to-[#071329] border-b border-[#E8B957]/20">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <div className="w-8 h-8 mx-auto text-[#E8B957]">
              <svg viewBox="0 0 100 80" fill="currentColor">
                <path d="M50 5 C45 28 35 48 50 72 C65 48 55 28 50 5 Z" />
                <path d="M50 72 C30 68 12 52 18 32 C30 40 42 56 50 72 Z" />
                <path d="M50 72 C70 68 88 52 82 32 C70 40 58 56 50 72 Z" />
              </svg>
            </div>
            <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-extrabold tracking-wider text-[#FFF4D8]">
              QUIZ ROUNDS
            </h2>
            <p className="font-['Cinzel',serif] text-xs sm:text-sm tracking-[0.25em] text-[#E8B957] uppercase font-semibold">
              A Journey Through Knowledge, Devotion and Service
            </p>
          </div>

          {/* 3 Rounds Cards Grid matching Reference Image 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. General Round */}
            <div className="bg-[#121f3a]/80 border-2 border-[#E8B957]/30 hover:border-[#E8B957] rounded-3xl p-6 sm:p-7 space-y-4 text-center transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8B957]/15 border border-[#E8B957]/40 flex items-center justify-center text-[#E8B957]">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-['Cinzel',serif] text-lg font-black text-[#FFF4D8]">
                  1. GENERAL ROUND
                </h3>
                <span className="inline-block text-xs font-bold text-[#E8B957] uppercase tracking-wider">
                  Open to all participants
                </span>
              </div>
              <p className="text-xs text-[#FFF4D8]/80 leading-relaxed font-medium">
                A diverse set of questions on Srila Prabhupada, ISKCON and his teachings.
              </p>
            </div>

            {/* 2. Rapid Fire Round */}
            <div className="bg-[#121f3a]/80 border-2 border-[#E8B957]/30 hover:border-[#E8B957] rounded-3xl p-6 sm:p-7 space-y-4 text-center transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F39B37]/15 border border-[#F39B37]/40 flex items-center justify-center text-[#F39B37]">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-['Cinzel',serif] text-lg font-black text-[#FFF4D8]">
                  2. RAPID FIRE ROUND
                </h3>
                <span className="inline-block text-xs font-bold text-[#F39B37] uppercase tracking-wider">
                  Selected participants
                </span>
              </div>
              <p className="text-xs text-[#FFF4D8]/80 leading-relaxed font-medium">
                Quick questions. Think fast! Test your sharpness and recall.
              </p>
            </div>

            {/* 3. Buzzer Round */}
            <div className="bg-[#121f3a]/80 border-2 border-[#E8B957]/30 hover:border-[#E8B957] rounded-3xl p-6 sm:p-7 space-y-4 text-center transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8B957]/20 border border-[#E8B957]/50 flex items-center justify-center text-[#E8B957]">
                <Bell className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-['Cinzel',serif] text-lg font-black text-[#FFF4D8]">
                  3. BUZZER ROUND
                </h3>
                <span className="inline-block text-xs font-bold text-[#E8B957] uppercase tracking-wider">
                  Top participants
                </span>
              </div>
              <p className="text-xs text-[#FFF4D8]/80 leading-relaxed font-medium">
                Real-time buzzer round with exciting questions. Speed, accuracy and presence of mind!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 px-4 bg-[#050e1f] text-center space-y-3 border-t border-[#E8B957]/20">
        <blockquote className="font-['Playfair_Display',serif] italic text-xs sm:text-sm text-[#FFF4D8]/80 max-w-lg mx-auto">
          &ldquo;Srila Prabhupada&apos;s knowledge is a treasure for the whole world.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] font-['Cinzel',serif] uppercase text-[#E8B957] font-bold">
          <span>❖</span>
          <span>SRILA PRABHUPADA</span>
          <span>❖</span>
        </div>
        <p className="text-[10px] text-[#FFF4D8]/50 pt-2">
          VIPLAVA 2026 • ISKCON Youth Festival • Gokul & Mathura Dham Live Arena
        </p>
      </footer>
    </div>
  );
};
