import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Quiz, RoomState, Participant, LeaderboardEntry, RoomPhase, BuzzerState } from '../../src/types.ts';
import { DEFAULT_QUIZZES } from '../../src/data/defaultQuizzes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RoomInternal {
  roomCode: string;
  quiz: Quiz;
  hostSocketId: string;
  phase: RoomPhase;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  questionStartedAt?: number;
  timeRemaining?: number;
  timerInterval?: NodeJS.Timeout | null;
  botAnswerTimeouts?: NodeJS.Timeout[];
  players: Map<string, Participant>;
  answers: Map<string, { optionId: string; responseTimeMs: number }>;
  buzzerState: BuzzerState;
  leaderboard: LeaderboardEntry[];
  allowNewParticipants: boolean;
  lastSavedAt: number;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const QUIZZES_FILE = path.join(DATA_DIR, 'saved-quizzes.json');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'quiz-snapshots.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class GameStore {
  private static instance: GameStore;
  public quizzes: Quiz[] = [...DEFAULT_QUIZZES];
  public rooms = new Map<string, RoomInternal>();

  private constructor() {
    this.initPersistence();
  }

  public static getInstance(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore();
    }
    return GameStore.instance;
  }

  private initPersistence() {
    try {
      if (fs.existsSync(QUIZZES_FILE)) {
        const raw = fs.readFileSync(QUIZZES_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.quizzes = parsed;
        } else {
          fs.writeFileSync(QUIZZES_FILE, JSON.stringify(this.quizzes, null, 2), 'utf-8');
        }
      } else {
        fs.writeFileSync(QUIZZES_FILE, JSON.stringify(this.quizzes, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[GameStore] Error loading saved quizzes:', err);
    }
  }

  public persistQuizzes() {
    try {
      fs.writeFileSync(QUIZZES_FILE, JSON.stringify(this.quizzes, null, 2), 'utf-8');
    } catch (err) {
      console.error('[GameStore] Failed to write quizzes:', err);
    }
  }

  public persistSnapshot(room: RoomInternal, reason: string) {
    try {
      const serializedRoom = {
        roomCode: room.roomCode,
        quizTitle: room.quiz.title,
        phase: room.phase,
        currentRoundIndex: room.currentRoundIndex,
        currentQuestionIndex: room.currentQuestionIndex,
        participantsCount: room.players.size,
        answersCount: room.answers.size,
        buzzerWinner: room.buzzerState.winnerName,
        savedAt: Date.now(),
        reason,
        topLeaderboard: room.leaderboard.slice(0, 10),
      };

      let existing: unknown[] = [];
      if (fs.existsSync(SNAPSHOTS_FILE)) {
        try {
          const raw = fs.readFileSync(SNAPSHOTS_FILE, 'utf-8');
          existing = JSON.parse(raw);
        } catch {
          existing = [];
        }
      }
      existing.push(serializedRoom);
      if (existing.length > 50) {
        existing = existing.slice(-50);
      }
      fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
      room.lastSavedAt = Date.now();
    } catch (err) {
      console.error('[GameStore] Snapshot persistence failed:', err);
    }
  }

  public getPublicRoomState(room: RoomInternal): RoomState {
    const currentQ = room.quiz.questions[room.currentQuestionIndex];
    let publicQ = undefined;

    if (currentQ) {
      if (room.phase === 'reveal' || room.phase === 'leaderboard' || room.phase === 'podium') {
        publicQ = currentQ;
      } else {
        const { correctOptionId, ...rest } = currentQ;
        publicQ = rest;
      }
    }

    const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
    const currentRound = enabledRounds[room.currentRoundIndex] || enabledRounds[0];

    let readyCount = 0;
    let connectedCount = 0;
    room.players.forEach((p) => {
      if (p.status === 'ready') readyCount++;
      if (p.status === 'connected' || p.status === 'ready') connectedCount++;
    });

    return {
      roomCode: room.roomCode,
      quizId: room.quiz.id,
      quizTitle: room.quiz.title,
      quizDescription: room.quiz.description,
      hostSocketId: room.hostSocketId,
      phase: room.phase,
      currentRoundIndex: room.currentRoundIndex,
      currentRoundType: currentRound?.type || 'general',
      currentRoundName: currentRound?.name || 'General Round',
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestionsInRound: room.quiz.questions.filter((q) => q.roundType === currentRound?.type).length,
      totalQuestions: room.quiz.questions.length,
      currentQuestion: publicQ,
      buzzerState: room.buzzerState,
      timeRemaining: room.timeRemaining,
      participantsCount: room.players.size,
      connectedCount,
      readyCount,
      answersReceivedCount: room.answers.size,
      leaderboard: room.leaderboard,
      allowNewParticipants: room.allowNewParticipants,
      lastSavedAt: room.lastSavedAt,
    };
  }

  public recalculateLeaderboard(room: RoomInternal) {
    const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

    const prevRanksMap = new Map<string, number>();
    room.leaderboard.forEach((entry) => {
      prevRanksMap.set(entry.id, entry.rank);
    });

    const newLeaderboard: LeaderboardEntry[] = sortedPlayers.map((player, index) => {
      const currentRank = index + 1;
      const prevRank = prevRanksMap.get(player.id) || currentRank;
      player.rank = currentRank;
      player.prevRank = prevRank;

      return {
        id: player.id,
        fullName: player.fullName,
        institution: player.institution,
        avatar: player.avatar || '🪷',
        score: player.score,
        rank: currentRank,
        prevRank: prevRank,
        streak: player.streak,
        lastPointsEarned: player.lastAnswer?.pointsEarned || 0,
        isCorrect: player.lastAnswer?.isCorrect,
      };
    });

    room.leaderboard = newLeaderboard;
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VP26';
    for (let i = 0; i < 2; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
