import { Router } from 'express';
import { GameStore } from '../state/store.ts';
import { Quiz } from '../../src/types.ts';
import { DEFAULT_QUIZZES } from '../../src/data/defaultQuizzes.ts';

export const quizRouter = Router();
const store = GameStore.getInstance();

// GET all quizzes
quizRouter.get('/', (_req, res) => {
  res.json(store.quizzes);
});

// GET single quiz by id
quizRouter.get('/:id', (req, res) => {
  const quiz = store.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json(quiz);
});

// POST create or update quiz
quizRouter.post('/', (req, res) => {
  const payload = req.body as Quiz;
  if (!payload || !payload.title || !Array.isArray(payload.questions)) {
    return res.status(400).json({ error: 'Invalid quiz payload: title and questions array required' });
  }

  const existingIdx = store.quizzes.findIndex((q) => q.id === payload.id);
  if (existingIdx >= 0) {
    store.quizzes[existingIdx] = payload;
  } else {
    store.quizzes.push(payload);
  }

  store.persistQuizzes();
  res.status(existingIdx >= 0 ? 200 : 201).json(payload);
});

// DELETE quiz by id
quizRouter.delete('/:id', (req, res) => {
  const initialLength = store.quizzes.length;
  store.quizzes = store.quizzes.filter((q) => q.id !== req.params.id);
  if (store.quizzes.length === initialLength) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  store.persistQuizzes();
  res.json({ success: true, message: 'Quiz deleted' });
});

// POST reset to defaults
quizRouter.post('/reset', (_req, res) => {
  store.quizzes = [...DEFAULT_QUIZZES];
  store.persistQuizzes();
  res.json({ success: true, message: 'Reset to default VIPLAVA 2026 quizzes', quizzes: store.quizzes });
});
