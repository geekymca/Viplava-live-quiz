import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types.ts';

// Configurable Server URL: supports independent client deployment (e.g., Vercel, Netlify)
// If VITE_SERVER_URL is provided, connects to that backend; otherwise connects to current origin.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  withCredentials: true,
});
