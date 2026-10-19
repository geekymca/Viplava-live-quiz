import React, { useState, useEffect } from 'react';
import { ViplavaEmblem } from './ViplavaEmblem.tsx';
import { RoomState, Participant } from '../types.ts';
import { sounds } from '../audio/soundEffects.ts';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Users,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Radio
} from 'lucide-react';

interface ViplavaJoinQuizProps {
  onBack: () => void;
  onJoinSuccess: (roomCode: string, participant: Participant) => void;
  serverError?: string | null;
  activeRoomState?: RoomState | null;
  onSocketJoin: (
    data: { roomCode: string; fullName: string; institution: string; participationType: 'individual' | 'team' },
    callback: (res: { success: boolean; error?: string; state?: RoomState; participant?: Participant }) => void
  ) => void;
}

export const ViplavaJoinQuiz: React.FC<ViplavaJoinQuizProps> = ({
  onBack,
  onJoinSuccess,
  serverError,
  activeRoomState,
  onSocketJoin,
}) => {
  // Join Flow Sub-phases: 'form' | 'loading' | 'success' | 'waiting'
  const [subPhase, setSubPhase] = useState<'form' | 'loading' | 'success' | 'waiting'>('form');

  const [quizCode, setQuizCode] = useState('VP26A8');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [participationType, setParticipationType] = useState<'individual' | 'team'>('individual');

  // Inline Validation Errors
  const [errors, setErrors] = useState<{
    quizCode?: string;
    fullName?: string;
    institution?: string;
  }>({});

  // Loading Steps Checkmarks
  const [loadingStep, setLoadingStep] = useState(0);
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    sounds.playDing();
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!quizCode || quizCode.trim().length < 4) {
      errs.quizCode = 'Invalid code. Please check and try again.';
    }
    if (!fullName || fullName.trim().length < 3) {
      errs.fullName = 'Name should be at least 3 characters.';
    }
    if (!institution || institution.trim().length < 2) {
      errs.institution = 'Please enter a valid institution name.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      sounds.playWrong();
      return;
    }

    sounds.playWhoosh();
    setSubPhase('loading');
    setLoadingStep(1);

    // Call server Socket.io join
    onSocketJoin(
      {
        roomCode: quizCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        institution: institution.trim(),
        participationType,
      },
      (res) => {
        if (!res.success) {
          sounds.playWrong();
          setSubPhase('form');
          setErrors({
            quizCode: res.error || 'Failed to join quiz room.',
          });
        } else {
          // Progress through steps smoothly
          setTimeout(() => setLoadingStep(2), 400);
          setTimeout(() => setLoadingStep(3), 800);
          setTimeout(() => {
            setLoadingStep(4);
            const p: Participant = res.participant || {
              id: 'p-me',
              fullName: fullName.trim(),
              institution: institution.trim(),
              participationType,
              status: 'ready',
              score: 0,
              streak: 0,
              rank: 1,
              prevRank: 1,
              joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setRegisteredParticipant(p);
            sounds.playCorrect();
            setSubPhase('success');
          }, 1200);
        }
      }
    );
  };

  const handleGoToWaitingRoom = () => {
    sounds.playWhoosh();
    setSubPhase('waiting');
    if (registeredParticipant) {
      onJoinSuccess(quizCode.trim().toUpperCase(), registeredParticipant);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#071329] text-[#FFF4D8] flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Strip */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-[#E8B957] hover:bg-[#21153D]/60 transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <ViplavaEmblem size="sm" showSubtitle={false} />

        <div className="w-10" />
      </div>

      {/* VIEWPORT BASED ON SUB-PHASE */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        {/* SUB-PHASE 1: REGISTRATION FORM */}
        {subPhase === 'form' && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
            {/* Header Titles */}
            <div className="space-y-1">
              <h2 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-extrabold text-[#FFF4D8]">
                Join <span className="text-[#E8B957]">the Quiz</span>
              </h2>
              <p className="text-xs text-[#FFF4D8]/70">
                Enter the quiz code shared by the host to become a part of Viplava 2026.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quiz Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFF4D8]">Quiz Code *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. VP26A8"
                    value={quizCode}
                    onChange={(e) => {
                      setQuizCode(e.target.value.toUpperCase());
                      if (errors.quizCode) setErrors({ ...errors, quizCode: undefined });
                    }}
                    className={`w-full bg-[#081224] border rounded-2xl px-4 py-3 text-sm font-mono font-bold tracking-wider uppercase text-[#E8B957] placeholder-[#FFF4D8]/30 focus:outline-none transition-colors ${
                      errors.quizCode ? 'border-rose-500' : 'border-[#E8B957]/40 focus:border-[#E8B957]'
                    }`}
                  />
                  {errors.quizCode ? (
                    <AlertCircle className="w-5 h-5 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  ) : quizCode.length >= 4 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  ) : null}
                </div>
                {errors.quizCode && (
                  <p className="text-xs text-rose-400 font-semibold">{errors.quizCode}</p>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFF4D8]">Your Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pankaj Kumar"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    className={`w-full bg-[#081224] border rounded-2xl px-4 py-3 text-sm font-semibold text-[#FFF4D8] placeholder-[#FFF4D8]/30 focus:outline-none transition-colors ${
                      errors.fullName ? 'border-rose-500' : 'border-[#E8B957]/40 focus:border-[#E8B957]'
                    }`}
                  />
                  {errors.fullName ? (
                    <AlertCircle className="w-5 h-5 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  ) : fullName.length >= 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  ) : null}
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-400 font-semibold">{errors.fullName}</p>
                )}
              </div>

              {/* Institution / College */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFF4D8]">Institution / College *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi University / IIT Delhi"
                    value={institution}
                    onChange={(e) => {
                      setInstitution(e.target.value);
                      if (errors.institution) setErrors({ ...errors, institution: undefined });
                    }}
                    className={`w-full bg-[#081224] border rounded-2xl px-4 py-3 text-sm font-semibold text-[#FFF4D8] placeholder-[#FFF4D8]/30 focus:outline-none transition-colors ${
                      errors.institution ? 'border-rose-500' : 'border-[#E8B957]/40 focus:border-[#E8B957]'
                    }`}
                  />
                  {errors.institution && (
                    <p className="text-xs text-rose-400 font-semibold">{errors.institution}</p>
                  )}
                </div>
              </div>

              {/* Participation Type */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#FFF4D8]">Participation Type</label>
                <div className="flex items-center gap-3 bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#E8B957] flex items-center justify-center p-0.5">
                    <div className="w-full h-full rounded-full bg-[#E8B957]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FFF4D8]">Individual participant</div>
                    <div className="text-[11px] text-[#FFF4D8]/60">Participate on your own</div>
                  </div>
                </div>
              </div>

              {/* Primary Continue Button */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-black text-sm shadow-xl shadow-[#E8B957]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Safety Badge */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#FFF4D8]/60 pt-2">
                <ShieldCheck className="w-4 h-4 text-[#E8B957]" />
                <span>Your details are safe and only used for this quiz event.</span>
              </div>
            </form>
          </div>
        )}

        {/* SUB-PHASE 2: JOINING QUIZ ANIMATION */}
        {subPhase === 'loading' && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-[32px] p-8 shadow-2xl text-center space-y-6 animate-fade-in">
            {/* Pulsing Sacred Emblem */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#E8B957]/20 animate-ping" />
              <div className="relative w-full h-full rounded-full bg-[#21153D] border-2 border-[#E8B957] flex items-center justify-center shadow-lg shadow-[#E8B957]/30">
                <div className="w-12 h-12 text-[#E8B957]">
                  <svg viewBox="0 0 100 80" fill="currentColor">
                    <path d="M50 5 C45 28 35 48 50 72 C65 48 55 28 50 5 Z" />
                    <path d="M50 72 C30 68 12 52 18 32 C30 40 42 56 50 72 Z" />
                    <path d="M50 72 C70 68 88 52 82 32 C70 40 58 56 50 72 Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-['Cinzel',serif] text-2xl font-black text-[#FFF4D8]">
                Joining Quiz...
              </h2>
              <p className="text-xs text-[#FFF4D8]/70">
                Please wait while we register your details into the live arena.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 max-w-xs mx-auto text-left text-xs">
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${loadingStep >= 1 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Validating quiz code</span>
              </div>
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${loadingStep >= 2 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Checking participant details</span>
              </div>
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${loadingStep >= 3 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Registering you in the room</span>
              </div>
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${loadingStep >= 4 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Preparing your session</span>
              </div>
            </div>

            <p className="font-['Playfair_Display',serif] italic text-xs text-[#E8B957]/80 pt-2">
              &ldquo;Knowledge awakens the soul and inspires us to serve.&rdquo;
            </p>
          </div>
        )}

        {/* SUB-PHASE 3: SUCCESSFULLY JOINED */}
        {subPhase === 'success' && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/40 rounded-[32px] p-8 shadow-2xl text-center space-y-6 animate-fade-in">
            {/* Golden Checkmark Badge */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#E8B957] to-[#F39B37] p-1 shadow-xl shadow-[#E8B957]/20">
              <div className="w-full h-full rounded-full bg-[#101b33] flex items-center justify-center">
                <Check className="w-10 h-10 text-[#E8B957] stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-['Cinzel',serif] text-2xl font-black text-[#FFF4D8]">
                Successfully Joined!
              </h2>
              <p className="text-xs text-[#E8B957] font-semibold">Welcome to Viplava 2026 Quiz</p>
              <p className="text-xs text-[#FFF4D8]/70">You have been added to the participant list.</p>
            </div>

            {/* Confirmation Summary Card */}
            <div className="bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Name</span>
                <span className="font-bold text-[#FFF4D8]">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Institution</span>
                <span className="font-bold text-[#FFF4D8]">{institution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Participation Type</span>
                <span className="font-bold text-[#FFF4D8]">Individual Participant</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#FFF4D8]/60">Room Code</span>
                <span className="font-mono font-black text-[#E8B957] tracking-wider">{quizCode}</span>
              </div>
            </div>

            <button
              onClick={handleGoToWaitingRoom}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-black text-sm shadow-xl shadow-[#E8B957]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
            >
              <span>Go to Waiting Room</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* SUB-PHASE 4: WAITING ROOM */}
        {subPhase === 'waiting' && (
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in text-center">
            {/* Connected Badge */}
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Connected</span>
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-['Cinzel',serif] text-2xl font-black text-[#FFF4D8]">
                Welcome {fullName}!
              </h2>
              <p className="text-xs text-[#E8B957] font-semibold">You&apos;re in the waiting room.</p>
              <p className="text-xs text-[#FFF4D8]/70">The host will start the quiz shortly.</p>
            </div>

            {/* Participants Joined Live Counter Bar */}
            <div className="bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#FFF4D8]/70 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#E8B957]" />
                  Participants Joined
                </span>
                <span className="text-xl font-black font-mono text-[#E8B957]">
                  {activeRoomState?.participantsCount || 128}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121f3a] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E8B957] to-[#F39B37] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, ((activeRoomState?.participantsCount || 128) / 500) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-[#FFF4D8]/50 text-left">Waiting for more participants...</p>
            </div>

            {/* Room Code with Copy */}
            <div className="flex items-center justify-between bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-3.5">
              <div className="text-left">
                <span className="text-[10px] text-[#FFF4D8]/60 uppercase tracking-wider block">
                  Room Code
                </span>
                <span className="font-mono font-black text-lg text-[#E8B957] tracking-widest">
                  {quizCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21153D] hover:bg-[#2e1d52] border border-[#E8B957]/40 text-[#E8B957] text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Instruction Checklist */}
            <div className="space-y-2 text-left text-xs text-[#FFF4D8]/80">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E8B957] shrink-0" />
                <span>The quiz will begin soon</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#E8B957] shrink-0" />
                <span>Stay on this page to receive the start signal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#E8B957] shrink-0" />
                <span>Keep this tab open for the best experience</span>
              </div>
            </div>

            <p className="font-['Playfair_Display',serif] italic text-xs text-[#E8B957]/80 pt-2">
              &ldquo;In the association of devotees, knowledge and devotion grow together.&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="text-center py-2 text-[10px] text-[#FFF4D8]/40">
        VIPLAVA 2026 • Srila Prabhupada Quiz
      </div>
    </div>
  );
};
