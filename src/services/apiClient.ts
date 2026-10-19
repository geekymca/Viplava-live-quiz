import { Quiz, RoomState, LeaderboardEntry } from '../types.ts';

// Configurable Server URL for independent client hosting
// Set VITE_SERVER_URL in .env when hosting client separately (e.g. Vercel, Netlify)
const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

export interface CertifiedResultsResponse {
  event: string;
  theme: string;
  roomCode: string;
  quizTitle: string;
  phase: string;
  completedAt: string | null;
  totalParticipants: number;
  totalQuestions: number;
  averageScore: number;
  topWinners: Array<{
    position: number;
    title: string;
    fullName: string;
    institution: string;
    score: number;
  }>;
  fullLeaderboard: LeaderboardEntry[];
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  theme: string;
  uptimeSeconds: number;
  activeRooms: number;
  totalQuizzes: number;
  activeParticipants: number;
  timestamp: string;
}

export const apiClient = {
  getServerUrl(): string {
    return SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  },

  /**
   * Fetch all saved quizzes from the central server
   */
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch(`${SERVER_URL}/api/quizzes`);
    if (!res.ok) {
      throw new Error(`Failed to fetch quizzes: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Save or update a quiz in the central database
   */
  async saveQuiz(quiz: Quiz): Promise<Quiz> {
    const res = await fetch(`${SERVER_URL}/api/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz),
    });
    if (!res.ok) {
      throw new Error(`Failed to save quiz: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch room state by room code
   */
  async getRoomState(roomCode: string): Promise<RoomState> {
    const res = await fetch(`${SERVER_URL}/api/rooms/${encodeURIComponent(roomCode.toUpperCase())}`);
    if (!res.ok) {
      throw new Error(`Room ${roomCode} not found`);
    }
    return res.json();
  },

  /**
   * Fetch live or final leaderboard for a room
   */
  async getRoomLeaderboard(roomCode: string): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${SERVER_URL}/api/rooms/${encodeURIComponent(roomCode.toUpperCase())}/leaderboard`);
    if (!res.ok) {
      throw new Error(`Leaderboard for room ${roomCode} not found`);
    }
    return res.json();
  },

  /**
   * Fetch official certified final results and statistics
   */
  async getRoomResults(roomCode: string): Promise<CertifiedResultsResponse> {
    const res = await fetch(`${SERVER_URL}/api/rooms/${encodeURIComponent(roomCode.toUpperCase())}/results`);
    if (!res.ok) {
      throw new Error(`Results for room ${roomCode} not found`);
    }
    return res.json();
  },

  /**
   * Check central backend server health
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${SERVER_URL}/api/health`);
    if (!res.ok) {
      throw new Error(`Server health check failed: ${res.statusText}`);
    }
    return res.json();
  },
};
