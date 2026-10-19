import { Router } from 'express';
import { GameStore } from '../state/store.ts';

export const healthRouter = Router();
const store = GameStore.getInstance();
const startTime = Date.now();

healthRouter.get('/', (_req, res) => {
  let totalParticipants = 0;
  store.rooms.forEach((r) => {
    totalParticipants += r.players.size;
  });

  res.json({
    status: 'healthy',
    service: 'VIPLAVA 2026 Game Engine Backend',
    theme: 'Srila Prabhupada Iskcon • Gokul, Mathura dham',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    activeRooms: store.rooms.size,
    totalQuizzes: store.quizzes.length,
    activeParticipants: totalParticipants,
    timestamp: new Date().toISOString(),
  });
});
