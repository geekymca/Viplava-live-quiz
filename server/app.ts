import express, { Express } from 'express';
import { quizRouter } from './routes/quizRoutes.ts';
import { roomRouter } from './routes/roomRoutes.ts';
import { healthRouter } from './routes/healthRoutes.ts';
import { GameStore } from './state/store.ts';

export function createServerApp(): Express {
  const app = express();

  // Enable JSON request body parsing
  app.use(express.json());

  // Universal CORS Middleware for independent client deployment
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API Routes
  app.use('/api/quizzes', quizRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/health', healthRouter);

  // Periodic active state ticker
  const store = GameStore.getInstance();
  setInterval(() => {
    store.rooms.forEach((room) => {
      if (room.phase === 'question' || room.phase === 'leaderboard' || room.phase === 'reveal') {
        store.persistSnapshot(room, 'periodic_active_ticker');
      }
    });
  }, 5000);

  return app;
}
