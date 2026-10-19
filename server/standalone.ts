import http from 'http';
import { Server } from 'socket.io';
import { createServerApp } from './app.ts';
import { registerSocketHandlers } from './socket/handlers.ts';
import { ClientToServerEvents, ServerToClientEvents } from '../src/types.ts';

const PORT = process.env.PORT || 3001;
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

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  VIPLAVA 2026 — STANDALONE BACKEND SERVER ACTIVE`);
  console.log(`  Port: ${PORT}`);
  console.log(`  REST API:   http://localhost:${PORT}/api/quizzes`);
  console.log(`  Health API: http://localhost:${PORT}/api/health`);
  console.log(`  Rooms API:  http://localhost:${PORT}/api/rooms`);
  console.log(`  Socket.IO:  Ready for client connections`);
  console.log(`=======================================================`);
});

export { app, server, io };
