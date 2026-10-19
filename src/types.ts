export type RoundType = 'general' | 'rapid_fire' | 'buzzer';

export interface RoundConfig {
  id: string;
  type: RoundType;
  name: string;
  description: string;
  enabled: boolean;
  questionCount: number;
  timeLimitSeconds: number;
  points: number;
  negativePoints: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  roundType: RoundType;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  timeLimitSeconds: number;
  points: number;
  explanation?: string;
  category?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  coverEmoji: string;
  rounds: RoundConfig[];
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'live' | 'completed';
  maxParticipants: number;
  allowNewParticipants: boolean;
  lockRegistrationOnStart: boolean;
  fasterAnswerBonus: boolean;
  negativeMarking: number;
  createdAt: number;
}

export interface Participant {
  id: string;
  fullName: string;
  institution: string;
  participationType: 'individual' | 'team';
  status: 'ready' | 'connected' | 'offline';
  score: number;
  streak: number;
  rank: number;
  prevRank: number;
  device?: string;
  joinedAt: string;
  avatar?: string;
  lastAnswer?: {
    questionId: string;
    optionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    responseTimeMs: number;
  };
}

export type RoomPhase =
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'reveal'
  | 'buzzer_open'
  | 'buzzer_locked'
  | 'leaderboard'
  | 'podium';

export interface BuzzerState {
  isOpen: boolean;
  winnerId: string | null;
  winnerName: string | null;
  timestamp?: number;
  status?: 'answering' | 'correct' | 'incorrect' | null;
}

export interface RoomState {
  roomCode: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  hostSocketId: string;
  phase: RoomPhase;
  currentRoundIndex: number;
  currentRoundType: RoundType;
  currentRoundName: string;
  currentQuestionIndex: number;
  totalQuestionsInRound: number;
  totalQuestions: number;
  currentQuestion?: Omit<QuizQuestion, 'correctOptionId'> & {
    correctOptionId?: string;
  };
  buzzerState: BuzzerState;
  timeRemaining?: number;
  participantsCount: number;
  connectedCount: number;
  readyCount: number;
  answersReceivedCount: number;
  leaderboard: LeaderboardEntry[];
  allowNewParticipants: boolean;
  lastSavedAt?: number;
}

export interface LeaderboardEntry {
  id: string;
  fullName: string;
  institution: string;
  avatar: string;
  score: number;
  rank: number;
  prevRank: number;
  streak: number;
  lastPointsEarned: number;
  isCorrect?: boolean;
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void;
  'room:player_joined': (player: Participant) => void;
  'room:player_left': (data: { id: string; participantsCount: number }) => void;
  'room:player_updated': (player: Participant) => void;
  'room:buzzer_pressed': (data: { winnerId: string; winnerName: string; timestamp: number }) => void;
  'room:answer_stats': (stats: { totalAnswered: number; totalPlayers: number; optionCounts: Record<string, number> }) => void;
  'room:error': (message: string) => void;
  'room:kicked': () => void;
  'player:result': (result: { isCorrect: boolean; pointsEarned: number; totalScore: number; rank: number; correctOptionId: string }) => void;
}

export interface ClientToServerEvents {
  'host:create_room': (quizId: string, callback: (res: { success: boolean; roomCode?: string; error?: string }) => void) => void;
  'player:join_room': (data: { roomCode: string; fullName: string; institution: string; participationType: 'individual' | 'team' }, callback: (res: { success: boolean; error?: string; state?: RoomState; participant?: Participant }) => void) => void;
  'player:set_ready': (data: { roomCode: string; ready: boolean }) => void;
  'player:submit_answer': (data: { roomCode: string; questionId: string; optionId: string }) => void;
  'player:press_buzzer': (data: { roomCode: string }) => void;
  'host:start_quiz': (roomCode: string) => void;
  'host:next_question': (roomCode: string) => void;
  'host:reveal_answer': (roomCode: string) => void;
  'host:open_buzzer': (roomCode: string) => void;
  'host:close_buzzer': (roomCode: string) => void;
  'host:award_buzzer': (data: { roomCode: string; isCorrect: boolean }) => void;
  'host:show_leaderboard': (roomCode: string) => void;
  'host:show_podium': (roomCode: string) => void;
  'host:reset_room': (roomCode: string) => void;
  'host:toggle_entry': (data: { roomCode: string; allow: boolean }) => void;
  'host:remove_participant': (data: { roomCode: string; participantId: string }) => void;
  'host:simulate_bots': (data: { roomCode: string; count: number }) => void;
}
