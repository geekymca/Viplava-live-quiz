import http from 'http';
import { Server } from 'socket.io';
import { createServerApp } from './app.ts';
import { registerSocketHandlers } from './socket/handlers.ts';
import { ClientToServerEvents, ServerToClientEvents } from '../src/types.ts';

export function createModularServer() {
  const app = createServerApp();
  const server = http.createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6,
  });

  registerSocketHandlers(io);

  return { app, server, io };
}

export * from './state/store.ts';
export * from './routes/quizRoutes.ts';
export * from './routes/roomRoutes.ts';
export * from './routes/healthRoutes.ts';
export * from './socket/handlers.ts';
export * from './app.ts';
