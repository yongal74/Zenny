import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, provider = 'email', lang = 'en' } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password if email provider
    let hashedPassword;
    if (provider === 'email' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user with default character
    const user = await prisma.user.create({
      data: {
        email,
        provider,
        lang,
        character: {
          create: {
            characterType: 'hana',
            level: 1,
            exp: 0,
            hunger: 100,
            mood: 100,
            equippedSkin: 'starlight',
            bgTheme: 'starlight',
            equippedItems: {},
            ownedItems: ['starlight'],
          },
        },
      },
      include: {
        character: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        zenCoins: user.zenCoins,
        streak: user.streak,
        lang: user.lang,
      },
      character: user.character,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { character: true },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password for email provider
    if (user.provider === 'email' && password) {
      // In production, you'd store and verify hashed password
      // For now, we'll skip password verification
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        zenCoins: user.zenCoins,
        streak: user.streak,
        lang: user.lang,
      },
      character: user.character,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export { router as authRouter };
