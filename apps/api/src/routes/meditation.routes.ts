import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

/**
 * GET /api/meditation/tracks
 * Get meditation tracks
 */
router.get('/tracks', async (req, res) => {
  try {
    const { emotion, type, lang = 'en' } = req.query;

    const where: any = { lang: lang as string };
    if (emotion) where.emotion = emotion as string;
    if (type) where.type = type as string;

    const tracks = await prisma.meditationTrack.findMany({
      where,
      orderBy: { weekCreated: 'desc' },
      take: 50,
    });

    res.json({ tracks });
  } catch (error) {
    console.error('Get meditation tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch meditation tracks' });
  }
});

/**
 * GET /api/meditation/tracks/:id
 * Get a specific meditation track
 */
router.get('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const track = await prisma.meditationTrack.findUnique({
      where: { id },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ track });
  } catch (error) {
    console.error('Get meditation track error:', error);
    res.status(500).json({ error: 'Failed to fetch meditation track' });
  }
});

export { router as meditationRouter };
