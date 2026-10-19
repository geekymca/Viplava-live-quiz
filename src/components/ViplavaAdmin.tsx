import React, { useState } from 'react';
import { ViplavaEmblem } from './ViplavaEmblem.tsx';
import { Quiz, QuizQuestion, RoundConfig, RoomState, Participant } from '../types.ts';
import { sounds } from '../audio/soundEffects.ts';
import {
  Plus,
  Play,
  RotateCcw,
  Check,
  Copy,
  Users,
  Settings,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  X,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Radio,
  Wifi,
  Eye,
  Sliders,
  ChevronRight,
  Sparkles,
  Download,
  Bell
} from 'lucide-react';

interface ViplavaAdminProps {
  quizzes: Quiz[];
  onSaveQuiz: (quiz: Quiz) => void;
  activeRoom: RoomState | null;
  onLaunchRoom: (quizId: string) => void;
  onStartQuiz: (roomCode: string) => void;
  onNextQuestion: (roomCode: string) => void;
  onRevealAnswer: (roomCode: string) => void;
  onOpenBuzzer: (roomCode: string) => void;
  onCloseBuzzer: (roomCode: string) => void;
  onShowLeaderboard: (roomCode: string) => void;
  onShowPodium: (roomCode: string) => void;
  onResetRoom: (roomCode: string) => void;
  onToggleEntry: (roomCode: string, allow: boolean) => void;
  onRemoveParticipant: (roomCode: string, participantId: string) => void;
  onSimulateBots: (roomCode: string, count: number) => void;
  onBackToHome: () => void;
}

export const ViplavaAdmin: React.FC<ViplavaAdminProps> = ({
  quizzes,
  onSaveQuiz,
  activeRoom,
  onLaunchRoom,
  onStartQuiz,
  onNextQuestion,
  onRevealAnswer,
  onOpenBuzzer,
  onCloseBuzzer,
  onShowLeaderboard,
  onShowPodium,
  onResetRoom,
  onToggleEntry,
  onRemoveParticipant,
  onSimulateBots,
  onBackToHome,
}) => {
  // Navigation tabs: 'dashboard' | 'wizard' | 'control_room'
  const [adminView, setAdminView] = useState<'dashboard' | 'wizard'>('dashboard');

  // Wizard state: Steps 1 to 4
  const [wizardStep, setWizardStep] = useState(1);
  const [editingQuiz, setEditingQuiz] = useState<Quiz>({
    id: `viplava-${Date.now()}`,
    title: 'Viplava 2026 – Srila Prabhupada Quiz',
    description: 'A quiz on the life, teachings and legacy of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada and ISKCON.',
    category: 'Srila Prabhupada & ISKCON',
    coverEmoji: '🪷',
    status: 'draft',
    maxParticipants: 1000,
    allowNewParticipants: true,
    lockRegistrationOnStart: true,
    fasterAnswerBonus: true,
    negativeMarking: 0,
    createdAt: Date.now(),
    rounds: [
      {
        id: 'r-1',
        type: 'general',
        name: 'General Round',
        description: 'Open to all participants. MCQs for everyone.',
        enabled: true,
        questionCount: 4,
        timeLimitSeconds: 15,
        points: 10,
        negativePoints: 0,
      },
      {
        id: 'r-2',
        type: 'rapid_fire',
        name: 'Rapid Fire Round',
        description: 'Selected participants. Quick questions.',
        enabled: true,
        questionCount: 3,
        timeLimitSeconds: 10,
        points: 15,
        negativePoints: 2,
      },
      {
        id: 'r-3',
        type: 'buzzer',
        name: 'Buzzer Round',
        description: 'Top participants only. Live buzzer format.',
        enabled: true,
        questionCount: 3,
        timeLimitSeconds: 0,
        points: 20,
        negativePoints: 5,
      },
    ],
    questions: [...(quizzes[0]?.questions || [])],
  });

  // Modal Dialog States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isStartQuizConfirmOpen, setIsStartQuizConfirmOpen] = useState(false);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isJoinSettingsOpen, setIsJoinSettingsOpen] = useState(false);
  const [participantFilter, setParticipantFilter] = useState<'all' | 'connected' | 'ready'>('all');
  const [searchParticipant, setSearchParticipant] = useState('');
  const [selectedParticipantDetail, setSelectedParticipantDetail] = useState<Participant | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Question Editor state
  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      id: `q-${Date.now()}`,
      roundType: 'general',
      text: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '' },
        { id: `opt-${Date.now()}-2`, text: '' },
        { id: `opt-${Date.now()}-3`, text: '' },
        { id: `opt-${Date.now()}-4`, text: '' },
      ],
      correctOptionId: `opt-${Date.now()}-1`,
      timeLimitSeconds: 15,
      points: 10,
      explanation: '',
      category: 'Srila Prabhupada History',
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    const existingIndex = editingQuiz.questions.findIndex((q) => q.id === editingQuestion.id);
    let updatedQuestions = [...editingQuiz.questions];
    if (existingIndex >= 0) {
      updatedQuestions[existingIndex] = editingQuestion;
    } else {
      updatedQuestions.push(editingQuestion);
    }
    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.filter((q) => q.id !== id),
    });
  };

  const handlePublishQuiz = () => {
    const publishedQuiz: Quiz = {
      ...editingQuiz,
      status: 'published',
    };
    onSaveQuiz(publishedQuiz);
    sounds.playFanfare();
    setAdminView('dashboard');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    sounds.playDing();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Mock list of connected participants for the Host Control Room modal view
  const mockParticipants: Participant[] = [
    { id: 'p1', fullName: 'Aarav Sharma', institution: 'Delhi University', participationType: 'individual', status: 'ready', score: 180, streak: 3, rank: 1, prevRank: 1, device: 'Mobile (Android)', joinedAt: '10:22 AM' },
    { id: 'p2', fullName: 'Meera Singh', institution: 'Hindu College', participationType: 'individual', status: 'ready', score: 160, streak: 2, rank: 2, prevRank: 2, device: 'Mobile (Chrome)', joinedAt: '10:24 AM' },
    { id: 'p3', fullName: 'Rohan Gupta', institution: 'IIT Delhi', participationType: 'individual', status: 'connected', score: 145, streak: 1, rank: 3, prevRank: 3, device: 'Laptop (Mac)', joinedAt: '10:25 AM' },
    { id: 'p4', fullName: 'Ananya Patel', institution: 'St. Xavier’s College', participationType: 'individual', status: 'ready', score: 130, streak: 1, rank: 4, prevRank: 4, device: 'Mobile (iPhone)', joinedAt: '10:26 AM' },
    { id: 'p5', fullName: 'Priya Sharma', institution: 'Kirori Mal College', participationType: 'individual', status: 'ready', score: 120, streak: 0, rank: 5, prevRank: 5, device: 'Mobile (Android)', joinedAt: '10:27 AM' },
    { id: 'p6', fullName: 'Sneha Iyer', institution: 'Lady Shri Ram College', participationType: 'individual', status: 'offline', score: 95, streak: 0, rank: 6, prevRank: 6, device: 'Mobile (Chrome)', joinedAt: '10:28 AM' },
  ];

  return (
    <div className="relative min-h-screen bg-[#071329] text-[#FFF4D8] flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Admin Header */}
      <nav className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[#E8B957]/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (adminView === 'wizard') setAdminView('dashboard');
              else onBackToHome();
            }}
            className="p-2 rounded-xl text-[#E8B957] hover:bg-[#21153D]/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ViplavaEmblem size="sm" showSubtitle={false} />
          <span className="font-['Cinzel',serif] text-xs font-bold text-[#E8B957] uppercase tracking-wider hidden sm:inline">
            Admin Control Center
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeRoom && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE: {activeRoom.roomCode}</span>
            </div>
          )}
          <button
            onClick={onBackToHome}
            className="px-3 py-1.5 rounded-xl bg-[#21153D] hover:bg-[#2d1c52] border border-[#E8B957]/30 text-[#FFF4D8] text-xs font-bold"
          >
            Exit Admin
          </button>
        </div>
      </nav>

      {/* ADMIN VIEWPORT CONTENT */}
      <div className="w-full max-w-5xl mx-auto flex-1 py-6">
        {/* IF A ROOM IS CURRENTLY ACTIVE / LAUNCHED -> SHOW HOST CONTROL ROOM */}
        {activeRoom ? (
          /* ======================================================== */
          /* PAGE 18 — HOST CONTROL ROOM (Matching Reference Image 2) */
          /* ======================================================== */
          <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                      ● Live Room
                    </span>
                    <span className="text-xs text-[#FFF4D8]/60">Viplava 2026 Quiz</span>
                  </div>
                  <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-black text-[#FFF4D8]">
                    Host Control Room
                  </h1>
                  <p className="text-xs text-[#E8B957] font-semibold mt-0.5">
                    {activeRoom.currentRoundName} • Phase: <strong className="uppercase">{activeRoom.phase}</strong>
                  </p>
                </div>

                {/* Big Room PIN Display with Copy */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#081224] border-2 border-[#E8B957]/50 rounded-2xl px-5 py-2.5 text-center shadow-lg">
                    <span className="text-[10px] text-[#FFF4D8]/60 uppercase tracking-widest block font-bold">
                      Room Code
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-black text-[#E8B957] tracking-widest">
                      {activeRoom.roomCode}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(activeRoom.roomCode)}
                    className="p-3.5 rounded-2xl bg-[#21153D] hover:bg-[#2d1c52] border border-[#E8B957]/40 text-[#E8B957] transition-colors"
                    title="Copy Room PIN"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards: Joined 128 / Connected 124 / Ready 98 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-4 text-center">
                  <Users className="w-5 h-5 text-[#E8B957] mx-auto mb-1" />
                  <div className="text-2xl font-black font-mono text-[#FFF4D8]">
                    {activeRoom.participantsCount || 128}
                  </div>
                  <span className="text-[10px] text-[#FFF4D8]/60 uppercase font-bold tracking-wider">
                    Joined
                  </span>
                </div>

                <div className="bg-[#081224] border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1 animate-pulse" />
                  <div className="text-2xl font-black font-mono text-emerald-300">
                    {activeRoom.connectedCount || 124}
                  </div>
                  <span className="text-[10px] text-emerald-300/80 uppercase font-bold tracking-wider">
                    Connected
                  </span>
                </div>

                <div className="bg-[#081224] border border-cyan-500/30 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <div className="text-2xl font-black font-mono text-cyan-300">
                    {activeRoom.readyCount || 98}
                  </div>
                  <span className="text-[10px] text-cyan-300/80 uppercase font-bold tracking-wider">
                    Ready
                  </span>
                </div>
              </div>

              {/* Entry Toggle & Action Rows */}
              <div className="space-y-3 pt-2">
                {/* Entry for new participants switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#081224] border border-[#E8B957]/25">
                  <div>
                    <div className="text-sm font-bold text-[#FFF4D8]">Entry for new participants</div>
                    <div className="text-xs text-[#FFF4D8]/60">
                      {activeRoom.allowNewParticipants ? 'Participants can join using the room code' : 'Entry locked by host'}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleEntry(activeRoom.roomCode, !activeRoom.allowNewParticipants)}
                    className={`relative w-12 h-7 rounded-full transition-colors p-1 ${
                      activeRoom.allowNewParticipants ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        activeRoom.allowNewParticipants ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Participant List row */}
                <div
                  onClick={() => setIsParticipantListOpen(true)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#081224] border border-[#E8B957]/25 hover:border-[#E8B957] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#E8B957]" />
                    <div>
                      <div className="text-sm font-bold text-[#FFF4D8]">Participant List</div>
                      <div className="text-xs text-[#FFF4D8]/60">View and manage participants ({activeRoom.participantsCount || 128})</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#E8B957]" />
                </div>

                {/* Network & Diagnostics row */}
                <div
                  onClick={() => setIsNetworkModalOpen(true)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#081224] border border-[#E8B957]/25 hover:border-[#E8B957] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-[#FFF4D8]">Network & Connection</div>
                      <div className="text-xs text-[#FFF4D8]/60">All systems running smoothly (100% synchronized)</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#E8B957]" />
                </div>
              </div>

              {/* SIMULATE CONTENDERS (HIGH VOLUME ENGINE) */}
              <div className="p-4 rounded-2xl bg-[#21153D]/60 border border-[#E8B957]/30 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#E8B957] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Simulate Live Contenders (1,000 Capacity Stress Test):
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sounds.playDing();
                      onSimulateBots(activeRoom.roomCode, 50);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#081224] border border-[#E8B957]/30 text-xs font-bold text-[#FFF4D8] hover:bg-[#152342]"
                  >
                    +50 Bots
                  </button>
                  <button
                    onClick={() => {
                      sounds.playDing();
                      onSimulateBots(activeRoom.roomCode, 200);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#081224] border border-[#E8B957]/30 text-xs font-bold text-[#FFF4D8] hover:bg-[#152342]"
                  >
                    +200 Bots
                  </button>
                  <button
                    onClick={() => {
                      sounds.playDing();
                      onSimulateBots(activeRoom.roomCode, 500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black hover:brightness-110"
                  >
                    +500 Contenders
                  </button>
                </div>
              </div>

              {/* HOST QUIZ ADVANCEMENT CONTROLS */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8B957]/20">
                <button
                  onClick={() => {
                    sounds.playWhoosh();
                    onResetRoom(activeRoom.roomCode);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>End Session / Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-2">
                  {activeRoom.phase === 'lobby' && (
                    <button
                      onClick={() => setIsStartQuizConfirmOpen(true)}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-black text-sm shadow-xl shadow-[#E8B957]/30 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                    >
                      <span>Start Quiz Now</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}

                  {activeRoom.phase === 'question' && (
                    <button
                      onClick={() => {
                        sounds.playDing();
                        onRevealAnswer(activeRoom.roomCode);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#E8B957] hover:bg-[#f39b37] text-[#071329] font-black text-xs shadow-lg"
                    >
                      <span>Reveal Answer</span>
                    </button>
                  )}

                  {activeRoom.currentRoundType === 'buzzer' && (
                    activeRoom.buzzerState.isOpen ? (
                      <button
                        onClick={() => {
                          sounds.playDing();
                          onCloseBuzzer(activeRoom.roomCode);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-black text-xs"
                      >
                        <span>Close Buzzer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playDing();
                          onOpenBuzzer(activeRoom.roomCode);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Open Buzzer for Participants</span>
                      </button>
                    )
                  )}

                  {activeRoom.phase === 'reveal' && (
                    <button
                      onClick={() => {
                        sounds.playDing();
                        onShowLeaderboard(activeRoom.roomCode);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] font-black text-xs shadow-lg"
                    >
                      <span>Show Live Leaderboard</span>
                    </button>
                  )}

                  {activeRoom.phase === 'leaderboard' && (
                    activeRoom.currentQuestionIndex + 1 < activeRoom.totalQuestions ? (
                      <button
                        onClick={() => {
                          sounds.playWhoosh();
                          onNextQuestion(activeRoom.roomCode);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#071329] font-black text-xs flex items-center gap-1.5"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playFanfare();
                          onShowPodium(activeRoom.roomCode);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] font-black text-xs shadow-xl"
                      >
                        <span>Crown Final Champions</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : adminView === 'dashboard' ? (
          /* ======================================================== */
          /* PAGE 11 — ADMIN DASHBOARD (Matching Reference Image 4)   */
          /* ======================================================== */
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-[#101b33]/90 border border-[#E8B957]/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-black text-[#FFF4D8]">
                  Admin Control Center
                </h1>
                <p className="text-xs text-[#E8B957] font-semibold mt-1">
                  Create, manage and run quiz events for Viplava 2026.
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playWhoosh();
                  setWizardStep(1);
                  setAdminView('wizard');
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-black text-xs sm:text-sm shadow-xl shadow-[#E8B957]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Quiz</span>
              </button>
            </div>

            {/* 4 Database-Backed Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#101b33] border border-[#E8B957]/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-[#FFF4D8]/60 uppercase tracking-wider block">
                  Total Quizzes
                </span>
                <div className="text-2xl font-black font-mono text-[#E8B957]">{quizzes.length}</div>
              </div>

              <div className="bg-[#101b33] border border-emerald-500/40 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Live Quiz
                </span>
                <div className="text-2xl font-black font-mono text-emerald-300">
                  0
                </div>
              </div>

              <div className="bg-[#101b33] border border-[#E8B957]/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-[#FFF4D8]/60 uppercase tracking-wider block">
                  Total Participants
                </span>
                <div className="text-2xl font-black font-mono text-[#E8B957]">
                  {quizzes.reduce((acc, q) => acc + (q.maxParticipants || 1000), 0)}
                </div>
              </div>

              <div className="bg-[#101b33] border border-[#E8B957]/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-[#FFF4D8]/60 uppercase tracking-wider block">
                  Total Questions
                </span>
                <div className="text-2xl font-black font-mono text-[#E8B957]">
                  {quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
                </div>
              </div>
            </div>

            {/* Recent Quizzes List */}
            <div className="bg-[#101b33]/90 border border-[#E8B957]/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Cinzel',serif] text-base font-bold text-[#FFF4D8]">
                  Recent Quizzes
                </h3>
                <span className="text-xs text-[#E8B957] font-bold cursor-pointer hover:underline">
                  View all ({quizzes.length})
                </span>
              </div>

              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-2xl bg-[#081224] border border-[#E8B957]/20 hover:border-[#E8B957]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-[#121f3a] rounded-xl border border-[#E8B957]/30">
                        {quiz.coverEmoji || '🪷'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#FFF4D8]">{quiz.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              quiz.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                            }`}
                          >
                            {quiz.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#FFF4D8]/60">
                          {quiz.questions.length} questions • {quiz.rounds?.length || 3} rounds
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setWizardStep(1);
                          setAdminView('wizard');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#21153D] hover:bg-[#2d1c52] border border-[#E8B957]/30 text-xs font-bold text-[#E8B957]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          sounds.playWhoosh();
                          onLaunchRoom(quiz.id);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black shadow-md hover:brightness-110 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#071329]" />
                        <span>Host Live</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* WIZARD STEPS 1-4 (Matching Reference Image 4)             */
          /* ======================================================== */
          <div className="bg-[#101b33]/95 border-2 border-[#E8B957]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
            {/* Wizard Header & Progress Dots */}
            <div className="flex items-center justify-between border-b border-[#E8B957]/20 pb-4">
              <div>
                <span className="text-xs font-['Cinzel',serif] text-[#E8B957] uppercase font-bold tracking-wider">
                  Step {wizardStep} of 4
                </span>
                <h2 className="font-['Cinzel',serif] text-xl sm:text-2xl font-black text-[#FFF4D8]">
                  {wizardStep === 1 && 'Basic Details'}
                  {wizardStep === 2 && 'Rounds & Rules'}
                  {wizardStep === 3 && 'Question Bank'}
                  {wizardStep === 4 && 'Review & Publish'}
                </h2>
              </div>

              {/* Step Pills */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      wizardStep === step
                        ? 'bg-[#E8B957] text-[#071329] ring-2 ring-[#E8B957]/40'
                        : wizardStep > step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#081224] text-slate-500 border border-slate-700'
                    }`}
                  >
                    {wizardStep > step ? '✓' : step}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: BASIC DETAILS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#FFF4D8]">Quiz Title *</label>
                  <input
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-2xl px-4 py-3 text-sm text-[#FFF4D8] focus:outline-none focus:border-[#E8B957]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#FFF4D8]">Event Description</label>
                  <textarea
                    rows={3}
                    value={editingQuiz.description}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                    className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-2xl px-4 py-3 text-sm text-[#FFF4D8] focus:outline-none focus:border-[#E8B957]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#FFF4D8]">Maximum Participants</label>
                    <select
                      value={editingQuiz.maxParticipants}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, maxParticipants: Number(e.target.value) })}
                      className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-2xl px-4 py-3 text-sm text-[#FFF4D8] focus:outline-none"
                    >
                      <option value={100}>100 Participants</option>
                      <option value={500}>500 Participants</option>
                      <option value={1000}>1,000 Participants (Full Scale)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#FFF4D8]">Event Mode</label>
                    <div className="p-3 bg-[#081224] border border-[#E8B957]/30 rounded-2xl flex items-center justify-between text-xs font-bold">
                      <span>Live Competition (Host Controlled)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ROUNDS & RULES */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[#FFF4D8]/70">
                  Select and configure the rounds for this Viplava 2026 quiz event:
                </p>

                {editingQuiz.rounds.map((round, rIdx) => (
                  <div
                    key={round.id}
                    className="p-4 rounded-2xl bg-[#081224] border border-[#E8B957]/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#21153D] text-[#E8B957] font-black text-xs flex items-center justify-center">
                          {rIdx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-[#FFF4D8]">{round.name}</div>
                          <div className="text-xs text-[#FFF4D8]/60">{round.description}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={round.enabled}
                        onChange={(e) => {
                          const updated = [...editingQuiz.rounds];
                          updated[rIdx].enabled = e.target.checked;
                          setEditingQuiz({ ...editingQuiz, rounds: updated });
                        }}
                        className="w-5 h-5 accent-[#E8B957]"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div>
                        <label className="text-[#FFF4D8]/60 block mb-1">Time per question</label>
                        <select
                          value={round.timeLimitSeconds}
                          onChange={(e) => {
                            const updated = [...editingQuiz.rounds];
                            updated[rIdx].timeLimitSeconds = Number(e.target.value);
                            setEditingQuiz({ ...editingQuiz, rounds: updated });
                          }}
                          className="w-full bg-[#101b33] border border-[#E8B957]/20 rounded-xl p-2 text-[#FFF4D8]"
                        >
                          <option value={10}>10 Seconds</option>
                          <option value={15}>15 Seconds</option>
                          <option value={20}>20 Seconds</option>
                          <option value={0}>Host Controlled (Buzzer)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[#FFF4D8]/60 block mb-1">Points per correct</label>
                        <input
                          type="number"
                          value={round.points}
                          onChange={(e) => {
                            const updated = [...editingQuiz.rounds];
                            updated[rIdx].points = Number(e.target.value);
                            setEditingQuiz({ ...editingQuiz, rounds: updated });
                          }}
                          className="w-full bg-[#101b33] border border-[#E8B957]/20 rounded-xl p-2 text-[#FFF4D8]"
                        />
                      </div>

                      <div>
                        <label className="text-[#FFF4D8]/60 block mb-1">Negative Marking</label>
                        <input
                          type="number"
                          value={round.negativePoints}
                          onChange={(e) => {
                            const updated = [...editingQuiz.rounds];
                            updated[rIdx].negativePoints = Number(e.target.value);
                            setEditingQuiz({ ...editingQuiz, rounds: updated });
                          }}
                          className="w-full bg-[#101b33] border border-[#E8B957]/20 rounded-xl p-2 text-[#FFF4D8]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: QUESTION BANK */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E8B957]">
                    Questions in Bank ({editingQuiz.questions.length})
                  </span>
                  <button
                    onClick={handleOpenAddQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black shadow"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {editingQuiz.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-[#081224] border border-[#E8B957]/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-bold text-[#E8B957] shrink-0">Q{idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#21153D] text-[#E8B957] border border-[#E8B957]/30 uppercase shrink-0">
                          {q.roundType}
                        </span>
                        <span className="text-[#FFF4D8] font-medium truncate">{q.text}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setIsQuestionModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-[#E8B957] hover:bg-[#21153D]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div className="bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                    <span className="text-[#FFF4D8]/60">Quiz Title</span>
                    <span className="font-bold text-[#FFF4D8]">{editingQuiz.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                    <span className="text-[#FFF4D8]/60">Total Questions</span>
                    <span className="font-bold text-[#E8B957] font-mono">{editingQuiz.questions.length} Questions</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                    <span className="text-[#FFF4D8]/60">Rounds</span>
                    <span className="font-bold text-[#FFF4D8]">
                      {editingQuiz.rounds.filter((r) => r.enabled).map((r) => r.name).join(' → ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                    <span className="text-[#FFF4D8]/60">Max Participants</span>
                    <span className="font-bold text-[#FFF4D8]">{editingQuiz.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#FFF4D8]/60">Status</span>
                    <span className="font-bold text-emerald-400 uppercase">Ready to Publish</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>All rounds, timers, and questions passed validation checks!</span>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8B957]/20">
              <button
                onClick={() => {
                  if (wizardStep === 1) setAdminView('dashboard');
                  else setWizardStep(wizardStep - 1);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                {wizardStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSaveQuiz(editingQuiz);
                    sounds.playDing();
                    setAdminView('dashboard');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#E8B957]/40 text-xs font-bold text-[#E8B957] hover:bg-[#21153D]"
                >
                  Save Draft
                </button>

                {wizardStep < 4 ? (
                  <button
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black shadow hover:brightness-110 flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePublishQuiz}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-lg hover:brightness-110 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT QUESTION MODAL (Matching Ref Image 4) */}
      {/* ======================================================== */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#101b33] border-2 border-[#E8B957]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 my-8 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8B957]/20">
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-[#FFF4D8]">
                Add / Edit Question
              </h3>
              <button onClick={() => setIsQuestionModalOpen(false)}>
                <X className="w-5 h-5 text-[#FFF4D8]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#FFF4D8] font-bold block mb-1">Round Assignment</label>
                <select
                  value={editingQuestion.roundType}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, roundType: e.target.value as any })}
                  className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-xl p-2.5 text-[#FFF4D8]"
                >
                  <option value="general">1. General Round (MCQ)</option>
                  <option value="rapid_fire">2. Rapid Fire Round (Quick)</option>
                  <option value="buzzer">3. Buzzer Round (Real-time)</option>
                </select>
              </div>

              <div>
                <label className="text-[#FFF4D8] font-bold block mb-1">Question Text *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter the transcendental question..."
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-xl p-2.5 text-[#FFF4D8]"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2 pt-1">
                <label className="text-[#FFF4D8] font-bold block">4 Answer Options</label>
                {editingQuestion.options.map((opt, optIdx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#21153D] text-[#E8B957] font-black flex items-center justify-center shrink-0">
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]}`}
                      value={opt.text}
                      onChange={(e) => {
                        const opts = [...editingQuestion.options];
                        opts[optIdx] = { ...opts[optIdx], text: e.target.value };
                        setEditingQuestion({ ...editingQuestion, options: opts });
                      }}
                      className="flex-1 bg-[#081224] border border-[#E8B957]/30 rounded-xl p-2 text-[#FFF4D8]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, correctOptionId: opt.id })}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] ${
                        editingQuestion.correctOptionId === opt.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#21153D] text-slate-400'
                      }`}
                    >
                      {editingQuestion.correctOptionId === opt.id ? 'Correct' : 'Mark'}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[#FFF4D8] font-bold block mb-1">Explanation (Revealed to Participants)</label>
                <input
                  type="text"
                  placeholder="Srila Prabhupada quote or shastric purport..."
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-[#081224] border border-[#E8B957]/30 rounded-xl p-2 text-[#FFF4D8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8B957]/20">
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#E8B957] to-[#F39B37] text-[#071329] text-xs font-black shadow"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: START QUIZ CONFIRMATION (Matching Ref Image 2)   */}
      {/* ======================================================== */}
      {isStartQuizConfirmOpen && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101b33] border-2 border-[#E8B957]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#E8B957] to-[#F39B37] flex items-center justify-center text-slate-950 text-2xl shadow-lg shadow-[#E8B957]/30">
              <Play className="w-8 h-8 fill-slate-950" />
            </div>

            <div className="space-y-1">
              <h3 className="font-['Cinzel',serif] text-2xl font-black text-[#FFF4D8]">
                Start the Quiz?
              </h3>
              <p className="text-xs text-[#FFF4D8]/70">
                Participants will be moved from the waiting room to Round 1 (General Round).
              </p>
            </div>

            <div className="bg-[#081224] border border-[#E8B957]/30 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Quiz</span>
                <span className="font-bold text-[#FFF4D8]">{activeRoom.quizTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Room Code</span>
                <span className="font-mono font-black text-[#E8B957]">{activeRoom.roomCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8B957]/15">
                <span className="text-[#FFF4D8]/60">Participants</span>
                <span className="font-bold text-[#FFF4D8]">{activeRoom.participantsCount || 128} joined</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#FFF4D8]/60">Entry Status</span>
                <span className="font-bold text-emerald-400">Locked on Start</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsStartQuizConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sounds.playFanfare();
                  setIsStartQuizConfirmOpen(false);
                  onStartQuiz(activeRoom.roomCode);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E8B957] via-[#F39B37] to-[#E8B957] hover:brightness-110 text-[#071329] font-black text-xs shadow-lg"
              >
                Start Quiz Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PARTICIPANTS LIST MODAL (Matching Ref Image 2)   */}
      {/* ======================================================== */}
      {isParticipantListOpen && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101b33] border-2 border-[#E8B957]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8B957]/20">
              <div>
                <h3 className="font-['Cinzel',serif] text-lg font-bold text-[#FFF4D8]">
                  Participants ({activeRoom.participantsCount || 128})
                </h3>
                <p className="text-xs text-[#FFF4D8]/60">Manage connected contenders</p>
              </div>
              <button onClick={() => setIsParticipantListOpen(false)}>
                <X className="w-5 h-5 text-[#FFF4D8]" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParticipantFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  participantFilter === 'all' ? 'bg-[#E8B957] text-[#071329]' : 'bg-[#081224] text-slate-400'
                }`}
              >
                All (128)
              </button>
              <button
                onClick={() => setParticipantFilter('connected')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  participantFilter === 'connected' ? 'bg-emerald-500 text-slate-950' : 'bg-[#081224] text-slate-400'
                }`}
              >
                Connected (124)
              </button>
              <button
                onClick={() => setParticipantFilter('ready')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  participantFilter === 'ready' ? 'bg-cyan-500 text-slate-950' : 'bg-[#081224] text-slate-400'
                }`}
              >
                Ready (98)
              </button>
            </div>

            {/* Participant Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {mockParticipants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#081224] border border-[#E8B957]/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#21153D] text-[#E8B957] font-bold flex items-center justify-center">
                      {p.fullName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#FFF4D8]">{p.fullName}</div>
                      <div className="text-[10px] text-[#FFF4D8]/60">{p.institution} • {p.device}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'ready'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : p.status === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => onRemoveParticipant(activeRoom.roomCode, p.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      title="Remove participant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsParticipantListOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#21153D] border border-[#E8B957]/30 text-xs font-bold text-[#E8B957]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: NETWORK & DIAGNOSTICS (Matching Ref Image 2)    */}
      {/* ======================================================== */}
      {isNetworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101b33] border-2 border-[#E8B957]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8B957]/20">
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-[#FFF4D8]">
                Network & Connection
              </h3>
              <button onClick={() => setIsNetworkModalOpen(false)}>
                <X className="w-5 h-5 text-[#FFF4D8]" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs font-bold">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
              <div>
                <div>Good Connection</div>
                <div className="text-[10px] text-emerald-400/80 font-normal">All systems running smoothly (WebSocket latency: 12ms)</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-[#081224] rounded-xl border border-emerald-500/30">
                <div className="font-mono font-black text-lg text-emerald-300">124</div>
                <span className="text-[10px] text-slate-400">Connected</span>
              </div>
              <div className="p-3 bg-[#081224] rounded-xl border border-amber-500/30">
                <div className="font-mono font-black text-lg text-amber-300">2</div>
                <span className="text-[10px] text-slate-400">Reconnecting</span>
              </div>
              <div className="p-3 bg-[#081224] rounded-xl border border-rose-500/30">
                <div className="font-mono font-black text-lg text-rose-300">2</div>
                <span className="text-[10px] text-slate-400">Offline</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-[#FFF4D8]/70 pt-2">
              <div className="flex justify-between">
                <span>Live Updates:</span>
                <span className="text-emerald-400 font-bold">Real-time sync active</span>
              </div>
              <div className="flex justify-between">
                <span>Server Status:</span>
                <span className="text-emerald-400 font-bold">Operational (Node.js Port 3000)</span>
              </div>
              <div className="flex justify-between">
                <span>Persistence:</span>
                <span className="text-emerald-400 font-bold">Auto-snapshots to disk</span>
              </div>
            </div>

            <button
              onClick={() => setIsNetworkModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#21153D] border border-[#E8B957]/30 text-xs font-bold text-[#E8B957] mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
