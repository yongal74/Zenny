import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { coachRouter } from './routes/coach.routes';
import { characterRouter } from './routes/character.routes';
import { shopRouter } from './routes/shop.routes';
import { meditationRouter } from './routes/meditation.routes';
import { questRouter } from './routes/quest.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─── 미들웨어 ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true }));

// ─── 라우터 ───────────────────────────────────────────────────
// Public
app.use('/api/auth', authRouter);

// Protected (JWT 필요)
app.use('/api/coach', authMiddleware, coachRouter);
app.use('/api/character', authMiddleware, characterRouter);
app.use('/api/shop', authMiddleware, shopRouter);
app.use('/api/meditation', authMiddleware, meditationRouter);
app.use('/api/quests', authMiddleware, questRouter);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Error handler (마지막에 등록)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Zenny API running on http://localhost:${PORT}`);
});

export default app;
