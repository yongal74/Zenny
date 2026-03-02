import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { generateCoachResponse } from '../services/openai.service';
import type { Language, ChatMessage } from '../../shared/types';

const router = Router();
const prisma = new PrismaClient();

// ─── POST /api/coach/session/start — 새 세션 시작 ─────────────
router.post('/session/start', async (req: Request, res: Response) => {
  const { userId } = req as any;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const lang = (user?.lang ?? 'en') as Language;

  const { response, quickReplies } = await generateCoachResponse({
    userId,
    message: 'start session greeting',
    lang,
    characterType: 'hana', // TODO: 사용자 캐릭터 타입 사용
    history: [],
    turnCount: 0,
  });

  const session = await prisma.coachSession.create({
    data: { userId, lang, messages: [], turnCount: 0 },
  });

  res.json({
    sessionId: session.id,
    response,
    quickReplies,
    model: 'gpt-4o-mini',
  });
});

// ─── POST /api/coach/chat — 메시지 전송 ──────────────────────
router.post('/chat', async (req: Request, res: Response) => {
  const { userId } = req as any;
  const { sessionId, message } = req.body as { sessionId: string; message: string };

  // 세션 조회 및 소유권 확인
  const session = await prisma.coachSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const history = session.messages as ChatMessage[];
  const lang = (session.lang ?? 'en') as Language;

  const { response, quickReplies, model } = await generateCoachResponse({
    userId,
    message,
    lang,
    characterType: 'hana',
    history,
    turnCount: session.turnCount,
  });

  // 메시지 저장
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  const aiMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
    quickReplies,
  };

  await prisma.coachSession.update({
    where: { id: sessionId },
    data: {
      messages: [...history, userMsg, aiMsg] as unknown as Prisma.InputJsonValue[],
      turnCount: { increment: 1 },
    },
  });

  return res.json({ response, quickReplies, model });
});

// ─── GET /api/coach/sessions — 과거 세션 목록 ────────────────
router.get('/sessions', async (req: Request, res: Response) => {
  const { userId } = req as any;
  const sessions = await prisma.coachSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, createdAt: true, turnCount: true, summary: true, lang: true },
  });
  res.json(sessions);
});

export { router as coachRouter };
