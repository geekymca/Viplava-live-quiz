# VIPLAVA 2026 — Client & Server Independent Publishing Guide

This project is architected with complete decoupling between:
1. **Client Side (`src/`)**: Pure React SPA responsible for UI rendering, animations (Three.js & Canvas Confetti), audio synthesis, participant flow, buzzer triggers, and admin dashboard.
2. **Server Side (`server/`)**: Authoritative Node.js service (Express + Socket.IO) serving REST endpoints and managing real-time room state, buzzer locks, scoring engines, contender simulation, and JSON snapshots.

---

## Architecture Overview

```
viplava-2026/
├── src/                          # 1. CLIENT SIDE (Pure React + Vite SPA)
│   ├── components/               # UI components (Landing, Join, Quiz, Admin, Leaderboard)
│   ├── services/apiClient.ts     # Central client API connector (calls VITE_SERVER_URL/api)
│   ├── socket.ts                 # Real-time WebSocket connector (connects to VITE_SERVER_URL)
│   ├── three/                    # Background 3D Yamuna grid & podium
│   ├── audio/                    # Sound effects generator (Web Audio API)
│   └── types.ts                  # Shared types
│
├── server/                       # 2. SERVER SIDE (Standalone Node.js Backend)
│   ├── routes/
│   │   ├── quizRoutes.ts         # REST: /api/quizzes (GET, POST, DELETE, reset)
│   │   ├── roomRoutes.ts         # REST: /api/rooms, /api/rooms/:code/results, /leaderboard
│   │   └── healthRoutes.ts       # REST: /api/health (server metrics & uptime)
│   ├── state/store.ts            # Central GameStore, snapshots & quizzes persistence
│   ├── socket/handlers.ts        # Authoritative Socket.IO rooms & buzzer lock logic
│   ├── app.ts                    # Express application & CORS configuration
│   ├── standalone.ts             # Dedicated standalone server entrypoint
│   └── index.ts                  # Modular server exports
│
├── data/                         # Persistent storage
│   ├── saved-quizzes.json        # Saved quizzes database
│   └── quiz-snapshots.json       # Game audit snapshots
│
└── server.ts                     # Fullstack dev runner (Express + Vite middlewares on port 3000)
```

---

## 1. Publishing Client Side Individually

The client can be published as a static single-page application to **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3 / CloudFront**.

### Build Command
```bash
npm run client:build
# or
npm run build
```
Output directory: `dist/`

### Environment Variables on Frontend Host
| Variable | Value | Description |
|---|---|---|
| `VITE_SERVER_URL` | `https://your-viplava-backend.onrender.com` | The URL of your published backend server. |

When `VITE_SERVER_URL` is set, `apiClient` and `socket.ts` will connect directly to your remote backend with CORS enabled.

---

## 2. Publishing Server Side Individually

The server can be published to **Render**, **Railway**, **Fly.io**, **AWS App Runner**, or any VPS/Docker container.

### Run Standalone Server
```bash
npm run server
# or
npx tsx server/standalone.ts
```

### Environment Variables on Backend Host
| Variable | Value | Description |
|---|---|---|
| `PORT` | `3001` or `8080` (auto-set by hosting providers) | Port for HTTP & WebSockets |
| `NODE_ENV` | `production` | Production mode |

### REST Endpoints Available
- `GET /api/health` — Service health, active rooms, contender counts
- `GET /api/quizzes` — Fetch all quizzes
- `POST /api/quizzes` — Create or update a quiz
- `GET /api/rooms` — List of active live rooms
- `GET /api/rooms/:roomCode` — Real-time room state
- `GET /api/rooms/:roomCode/results` — Certified final results & stats export
- `GET /api/rooms/:roomCode/leaderboard` — Current leaderboard rankings

---

## 3. Running Both Together (Fullstack / Dev Mode)

For local development or single-container deployment:
```bash
npm run dev
```
Runs on `http://localhost:3000` with both client UI and server endpoints unified.
