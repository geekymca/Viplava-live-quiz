import path from 'path';
import { fileURLToPath } from 'url';
import { createModularServer } from './server/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const { app, server } = createModularServer();

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  VIPLAVA 2026 — FULLSTACK SERVER RUNNING`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Client UI:  http://localhost:${PORT}`);
    console.log(`  REST API:   http://localhost:${PORT}/api/quizzes`);
    console.log(`  Health API: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
