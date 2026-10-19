import React, { useState, useEffect } from 'react';
import { ViplavaEmblem } from './ViplavaEmblem.tsx';
import { RoomState, Participant, LeaderboardEntry } from '../types.ts';
import { apiClient } from '../services/apiClient.ts';
import { sounds } from '../audio/soundEffects.ts';
import confetti from 'canvas-confetti';
import {
  Bell,
  Timer,
  CheckCircle2,
  XCircle,
  Trophy,
  Medal,
  Award,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Share2,
  Download,
  Users
} from 'lucide-react';

interface ViplavaActiveQuizProps {
  roomState: RoomState;
  currentParticipant: Participant | null;
  onSubmitAnswer: (roomCode: string, questionId: string, optionId: string) => void;
  onPressBuzzer: (roomCode: string) => void;
  playerResult?: {
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    rank: number;
    correctOptionId: string;
  } | null;
  onExit: () => void;
}

export const ViplavaActiveQuiz: React.FC<ViplavaActiveQuizProps> = ({
  roomState,
  currentParticipant,
  onSubmitAnswer,
  onPressBuzzer,
  playerResult,
  onExit,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [buzzed, setBuzzed] = useState(false);

  useEffect(() => {
    setSelectedOptionId(null);
    setSubmitted(false);
    setBuzzed(false);
  }, [roomState.currentQuestionIndex, roomState.currentRoundType]);

  const handleSelectOption = (optId: string) => {
    if (submitted) return;
    sounds.playDing();
    setSelectedOptionId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || submitted || !roomState.currentQuestion) return;
    sounds.playWhoosh();
    setSubmitted(true);
    onSubmitAnswer(roomState.roomCode, roomState.currentQuestion.id, selectedOptionId);
  };

  const handleBuzzerPress = () => {
    if (buzzed || !roomState.buzzerState.isOpen) return;
    sounds.playDing();
    setBuzzed(true);
    onPressBuzzer(roomState.roomCode);
  };

  const isBuzzerRound = roomState.currentRoundType === 'buzzer';
  const isRapidFire = roomState.currentRoundType === 'rapid_fire';

  const myEntry = roomState.leaderboard.find((e) => e.id === currentParticipant?.id);

  return (
    <div className="relative min-h-screen bg-[#071329] text-[#FFF4D8] flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Participant Status Strip */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between bg-[#101b33]/90 border border-[#E8B957]/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <ViplavaEmblem size="sm" showSubtitle={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#FFF4D8]">
                {currentParticipant?.fullName || 'Participant'}
              </span>
              <span className="text-[10px] bg-[#E8B957]/20 text-[#E8B957] border border-[#E8B957]/40 px-1.5 py-0.2 rounded font-bold">
                {roomState.currentRoundName}
              </span>
            </div>
            <p className="text-[11px] text-[#FFF4D8]/60">
              {currentParticipant?.institution || 'Viplava 2026'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-black font-mono text-[#E8B957]">
            {(myEntry?.score || currentParticipant?.score || 0).toLocaleString()} <span className="text-[10px] uppercase">PTS</span>
          </div>
          <div className="text-[11px] font-bold text-[#FFF4D8]/70">
            Rank <strong className="text-[#E8B957]">#{myEntry?.rank || currentParticipant?.rank || 1}</strong>
          </div>
        </div>
      </div>

      {/* MAIN ROUND TAKING AREA */}
      <div className="w-full max-w-2xl mx-auto my-auto py-6">
        {/* PHASE 1: ACTIVE QUESTION (GENERAL & RAPID FIRE) */}
        {roomState.phase === 'question' && roomState.currentQuestion && !isBuzzerRound && (
          <div className="space-y-6 animate-fade-in">
            {/* Round & Countdown Header */}
            <div className="flex items-center justify-between bg-[#101b33] border border-[#E8B957]/30 rounded-2xl p-4">
              <span className="text-xs font-bold text-[#E8B957] uppercase tracking-wider">
                {roomState.currentRoundName} • Question {roomState.currentQuestionIndex + 1}
              </span>

              {/* Countdown Circular Timer Ring */}
              <div className="flex items-center gap-2 bg-[#081224] border border-[#E8B957]/40 px-3.5 py-1.5 rounded-xl">
                <Timer className={`w-4 h-4 ${Number(roomState.timeRemaining) <= 3 ? 'text-rose-400 animate-ping' : 'text-[#E8B957]'}`} />
                <span className={`text-base font-black font-mono ${Number(roomState.timeRemaining) <= 3 ? 'text-rose-400' : 'text-[#E8B957]'}`}>
                  00:{String(roomState.timeRemaining || 0).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Text Box */}
            <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
              <h2 className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[#FFF4D8] leading-relaxed">
                {roomState.currentQuestion.text}
              </h2>
            </div>

            {/* 4 Answer Options */}
            <div className="space-y-3">
              {roomState.currentQuestion.options.map((opt, idx) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    disabled={submitted}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold transition-all flex items-center justify-between shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] border-[#E8B957] scale-[1.01] shadow-[#E8B957]/20 font-black'
                        : submitted
                        ? 'bg-[#101b33]/50 border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-[#101b33] border-[#E8B957]/25 hover:border-[#E8B957] text-[#FFF4D8] hover:bg-[#1a2847]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? 'bg-[#071329] text-[#E8B957]' : 'bg-[#081224] text-[#E8B957] border border-[#E8B957]/30'
                        }`}
                      >
                        {optLetter}
                      </span>
                      <span className="text-sm sm:text-base">{opt.text}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#071329] shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Answer Button */}
            {!submitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmit}
                className={`w-full py-4 rounded-2xl font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
                  selectedOptionId
                    ? 'bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] shadow-[#E8B957]/30 transform hover:scale-[1.01]'
                    : 'bg-[#101b33] text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Answer submitted! Waiting for round completion...</span>
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: BUZZER ROUND */}
        {(roomState.phase === 'buzzer_open' || roomState.phase === 'buzzer_locked' || isBuzzerRound) && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-['Cinzel',serif] font-bold text-[#E8B957] uppercase tracking-wider">
                Round 3 • Buzzer Round
              </span>
              <h2 className="text-2xl font-black text-[#FFF4D8]">
                Who is ready to answer?
              </h2>
              {roomState.currentQuestion && (
                <p className="text-sm text-[#FFF4D8]/90 font-medium pt-2 max-w-lg mx-auto">
                  {roomState.currentQuestion.text}
                </p>
              )}
            </div>

            {/* GIANT CENTRAL GOLDEN BUZZER BUTTON */}
            <div className="py-6 flex flex-col items-center justify-center">
              <button
                disabled={!roomState.buzzerState.isOpen || buzzed}
                onClick={handleBuzzerPress}
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all transform ${
                  roomState.buzzerState.isOpen && !buzzed
                    ? 'bg-gradient-to-tr from-[#B37D22] via-[#E8B957] to-[#FFF4D8] hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(232,185,87,0.6)] cursor-pointer'
                    : 'bg-[#1b253b] border-4 border-slate-700 opacity-60 cursor-not-allowed shadow-none'
                }`}
              >
                {roomState.buzzerState.isOpen && (
                  <div className="absolute inset-0 rounded-full border-4 border-[#FFF4D8]/60 animate-ping opacity-40 pointer-events-none" />
                )}
                <Bell
                  className={`w-14 h-14 mb-2 ${
                    roomState.buzzerState.isOpen && !buzzed ? 'text-[#071329] stroke-[2.5]' : 'text-slate-500'
                  }`}
                />
                <span
                  className={`font-['Cinzel',serif] text-2xl font-black tracking-widest ${
                    roomState.buzzerState.isOpen && !buzzed ? 'text-[#071329]' : 'text-slate-500'
                  }`}
                >
                  BUZZ!
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${
                    roomState.buzzerState.isOpen && !buzzed ? 'text-[#071329]/80' : 'text-slate-600'
                  }`}
                >
                  {buzzed ? 'Buzzed!' : 'TAP ONCE'}
                </span>
              </button>

              <div className="mt-4">
                {roomState.buzzerState.winnerName ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold animate-bounce-subtle">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>First to Buzz: {roomState.buzzerState.winnerName}!</span>
                  </div>
                ) : roomState.buzzerState.isOpen ? (
                  <span className="text-xs text-[#E8B957] font-bold animate-pulse">
                    Buzzer OPEN — Press now!
                  </span>
                ) : (
                  <span className="text-xs text-[#FFF4D8]/50">
                    Waiting for host to open buzzer
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: REVEAL PHASE */}
        {roomState.phase === 'reveal' && (
          <div
            className={`border-2 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in ${
              playerResult?.isCorrect
                ? 'bg-gradient-to-b from-emerald-950/80 via-[#101b33] to-[#071329] border-emerald-500/60'
                : 'bg-gradient-to-b from-rose-950/80 via-[#101b33] to-[#071329] border-rose-500/60'
            }`}
          >
            <div className="text-5xl">
              {playerResult?.isCorrect ? '🪷' : '🙏'}
            </div>

            <div className="space-y-1">
              <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-black text-white">
                {playerResult?.isCorrect ? 'Correct Answer!' : 'Not Quite!'}
              </h2>
              {playerResult?.isCorrect ? (
                <div className="text-2xl font-black font-mono text-emerald-400">
                  +{playerResult.pointsEarned} Points
                </div>
              ) : (
                <p className="text-xs text-rose-300">
                  Keep your focus for the upcoming questions!
                </p>
              )}
            </div>

            {roomState.currentQuestion?.explanation && (
              <div className="bg-[#081224]/80 border border-[#E8B957]/30 rounded-2xl p-4 text-xs text-[#FFF4D8]/90 text-left">
                <strong className="text-[#E8B957] block mb-1">Srila Prabhupada Purport:</strong>
                {roomState.currentQuestion.explanation}
              </div>
            )}
          </div>
        )}

        {/* PHASE 4: LEADERBOARD PHASE */}
        {roomState.phase === 'leaderboard' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1 pb-2">
              <span className="text-xs font-['Cinzel',serif] font-bold text-[#E8B957] uppercase tracking-wider">
                Viplava 2026 Standings
              </span>
              <h2 className="font-['Cinzel',serif] text-2xl font-black text-[#FFF4D8]">
                Leaderboard
              </h2>
            </div>

            {/* TOP 3 PODIUM */}
            <div className="grid grid-cols-3 gap-2.5 items-end pt-4 pb-2">
              {/* 2nd Place */}
              <div className="bg-[#101b33] border border-slate-300/40 rounded-2xl p-3 text-center space-y-1 transform translate-y-4">
                <span className="text-2xl">🥈</span>
                <div className="font-bold text-xs truncate">{roomState.leaderboard[1]?.fullName || 'Contender'}</div>
                <div className="text-xs font-mono font-bold text-[#E8B957]">
                  {roomState.leaderboard[1]?.score || 0} pts
                </div>
                <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full block">#2</span>
              </div>

              {/* 1st Place */}
              <div className="bg-[#1b2847] border-2 border-[#E8B957] rounded-2xl p-4 text-center space-y-1 shadow-xl shadow-[#E8B957]/20 transform -translate-y-2">
                <span className="text-3xl">👑</span>
                <div className="font-black text-sm text-[#E8B957] truncate">
                  {roomState.leaderboard[0]?.fullName || 'Champion'}
                </div>
                <div className="text-sm font-mono font-black text-[#FFF4D8]">
                  {roomState.leaderboard[0]?.score || 0} pts
                </div>
                <span className="text-[10px] text-[#071329] bg-[#E8B957] font-black px-2.5 py-0.5 rounded-full inline-block">#1 WINNER</span>
              </div>

              {/* 3rd Place */}
              <div className="bg-[#101b33] border border-amber-700/50 rounded-2xl p-3 text-center space-y-1 transform translate-y-6">
                <span className="text-2xl">🥉</span>
                <div className="font-bold text-xs truncate">{roomState.leaderboard[2]?.fullName || 'Contender'}</div>
                <div className="text-xs font-mono font-bold text-[#E8B957]">
                  {roomState.leaderboard[2]?.score || 0} pts
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full block">#3</span>
              </div>
            </div>

            {/* Full List */}
            <div className="space-y-2 pt-6">
              {roomState.leaderboard.slice(0, 10).map((entry) => {
                const isMe = entry.id === currentParticipant?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isMe ? 'bg-[#E8B957]/20 border-[#E8B957]' : 'bg-[#101b33] border-[#E8B957]/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#081224] text-[#E8B957] font-black text-xs flex items-center justify-center">
                        #{entry.rank}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-[#FFF4D8]">
                          {entry.fullName} {isMe && '(You)'}
                        </span>
                        <div className="text-[10px] text-[#FFF4D8]/50">{entry.institution}</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-xs text-[#E8B957]">
                      {entry.score} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 5: FINAL PODIUM */}
        {roomState.phase === 'podium' && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#E8B957] to-[#F39B37] flex items-center justify-center text-3xl shadow-lg shadow-[#E8B957]/30">
              👑
            </div>

            <div className="space-y-1">
              <span className="text-xs font-['Cinzel',serif] tracking-widest text-[#E8B957] uppercase font-bold">
                Viplava 2026 Quiz
              </span>
              <h2 className="font-['Cinzel',serif] text-3xl font-black text-[#FFF4D8]">
                Champions of Knowledge
              </h2>
            </div>

            {/* Grand Winner */}
            <div className="bg-[#081224] border-2 border-[#E8B957] rounded-2xl p-5 space-y-2">
              <div className="text-3xl">🪷</div>
              <h3 className="text-lg font-black text-[#E8B957]">
                {roomState.leaderboard[0]?.fullName || 'Devotee Winner'}
              </h3>
              <p className="text-xs text-[#FFF4D8]/70">
                {roomState.leaderboard[0]?.institution}
              </p>
              <div className="text-xl font-mono font-black text-[#FFF4D8]">
                {roomState.leaderboard[0]?.score || 0} Total Points
              </div>
            </div>

            {/* Participant Result */}
            <div className="p-4 rounded-xl bg-[#21153D] border border-[#E8B957]/30 text-xs">
              <span>Your Final Rank: </span>
              <strong className="text-[#E8B957] font-black text-sm">#{myEntry?.rank || 1}</strong>
              <span className="mx-2">•</span>
              <span>Your Score: </span>
              <strong className="text-[#E8B957] font-black text-sm">{myEntry?.score || 0} pts</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => {
                  sounds.playDing();
                  navigator.clipboard.writeText(`I scored ${myEntry?.score || 0} points in VIPLAVA 2026 Srila Prabhupada Quiz! Rank #${myEntry?.rank || 1}`);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#21153D] border border-[#E8B957]/40 text-[#E8B957] text-xs font-bold hover:bg-[#2d1c52] transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Result</span>
              </button>

              <button
                onClick={async () => {
                  sounds.playDing();
                  try {
                    const results = await apiClient.getRoomResults(roomState.roomCode);
                    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `viplava-2026-results-${roomState.roomCode}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Failed to download results:', err);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#101b33] border border-[#E8B957]/40 text-[#FFF4D8] text-xs font-bold hover:bg-[#182747] transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-[#E8B957]" />
                <span>Export Results</span>
              </button>

              <button
                onClick={onExit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#E8B957]/20"
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-2 text-[10px] text-[#FFF4D8]/40">
        VIPLAVA 2026 • Live Competition Arena
      </div>
    </div>
  );
};
