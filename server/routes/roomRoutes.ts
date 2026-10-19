import { Router } from 'express';
import { GameStore } from '../state/store.ts';

export const roomRouter = Router();
const store = GameStore.getInstance();

// GET all active rooms
roomRouter.get('/', (_req, res) => {
  const roomList = Array.from(store.rooms.values()).map((r) => ({
    roomCode: r.roomCode,
    quizTitle: r.quiz.title,
    phase: r.phase,
    participantsCount: r.players.size,
    currentRoundIndex: r.currentRoundIndex,
    currentQuestionIndex: r.currentQuestionIndex,
    lastSavedAt: r.lastSavedAt,
  }));
  res.json(roomList);
});

// GET specific room state
roomRouter.get('/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  const room = store.rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: `Room ${roomCode} not found` });
  }
  res.json(store.getPublicRoomState(room));
});

// GET participants for a room
roomRouter.get('/:roomCode/participants', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  const room = store.rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: `Room ${roomCode} not found` });
  }
  const participants = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    fullName: p.fullName,
    institution: p.institution,
    participationType: p.participationType,
    status: p.status,
    score: p.score,
    rank: p.rank,
    streak: p.streak,
    joinedAt: p.joinedAt,
    device: p.device,
  }));
  res.json(participants);
});

// GET leaderboard for a room
roomRouter.get('/:roomCode/leaderboard', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  const room = store.rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: `Room ${roomCode} not found` });
  }
  res.json(room.leaderboard);
});

// GET final certified results and analytics for a room
roomRouter.get('/:roomCode/results', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  const room = store.rooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: `Room ${roomCode} not found` });
  }

  const sorted = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const winners = sorted.slice(0, 3).map((p, idx) => ({
    position: idx + 1,
    title: idx === 0 ? 'Gold Medal Champion' : idx === 1 ? 'Silver Medal Runner-Up' : 'Bronze Medal',
    fullName: p.fullName,
    institution: p.institution,
    score: p.score,
  }));

  const totalQuestions = room.quiz.questions.length;
  const averageScore = sorted.length > 0
    ? Math.round(sorted.reduce((acc, p) => acc + p.score, 0) / sorted.length)
    : 0;

  res.json({
    event: 'VIPLAVA 2026 — Srila Prabhupada Quiz',
    theme: 'Srila Prabhupada Iskcon • Gokul, Mathura dham',
    roomCode: room.roomCode,
    quizTitle: room.quiz.title,
    phase: room.phase,
    completedAt: room.phase === 'podium' ? new Date().toISOString() : null,
    totalParticipants: room.players.size,
    totalQuestions,
    averageScore,
    topWinners: winners,
    fullLeaderboard: room.leaderboard,
  });
});
