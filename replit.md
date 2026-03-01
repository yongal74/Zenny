# replit.md

## Overview

**Zenny** — A gamified mental wellness app for the North American market, built as a cross-platform mobile application using Expo (React Native) with an Express backend. The core concept is a character-companion (Tamagotchi-style) that evolves as users practice mindfulness, meditation, and emotional check-ins. Users earn Zen Coins, level up their character, and unlock accessories through daily wellness habits.

The app is **bilingual (EN/KO)**, targeting the North American market with a premium dark wellness aesthetic (deep navy/slate + aurora gradients). **Cost minimization is critical** — button-driven flows are used instead of constant AI API calls.

## User Preferences

- Preferred communication style: Simple, everyday language
- User speaks Korean, prefers Korean communication
- Design: Premium dark wellness aesthetic — deep bg (`#0D1117`), surface (`#161B22`), accent (`#7C6DC5`), gold (`#F59E0B`)
- Bilingual (EN/KO) with language toggle
- Conversational UI is a secondary feature — main flow is button/quest-driven
- Minimize Replit development and operational costs

## Project Structure (Monorepo)

```
zenny/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── App.tsx      # Entry point
│   │   ├── src/
│   │   │   ├── screens/ # Home, Auth, AI Coach, Meditation, Quest, Shop
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── stores/  # Zustand state management
│   │   │   ├── services/ # API calls, AI coach
│   │   │   ├── constants/ # Colors, fonts
│   │   │   └── types/
│   │   └── package.json
│   └── api/             # Express backend
│       ├── src/server.ts
│       ├── prisma/      # Prisma ORM + PostgreSQL
│       └── package.json
├── packages/            # Shared types
├── .replit              # Replit config
└── package.json         # Root scripts
```

## App Structure — 5 Tabs

1. **Home** — Character display (Tamagotchi), Zen Coins, daily quests, mood check-in CTA
2. **AI Coach** — Conversational AI coach with button-driven flows
3. **Meditation** — Guided meditation sessions with audio
4. **Quest** — Daily/weekly quests earning Zen Coins
5. **Shop** — Cosmetic items purchasable with Zen Coins

## Character System

- 5 character types: `hana`, `sol`, `miri`, `bom`, `ize`
- Pixel art kawaii style (dark bg with glowing aura)
- Character grows visually with level (EXP-based progression)
- Background themes: `starlight`, `ocean`, `aurora`, `zen`
- Level system: Level = floor(totalExp / 100) + 1

## Monetization

- **Zen Coins** earned via daily quests, check-ins, meditation
- Cosmetic shop items (skins, accessories, backgrounds)
- Premium subscription for advanced AI coach features

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo ~51 with React Native 0.74
- **Routing**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: Zustand + TanStack React Query
- **Fonts**: DM Sans (UI), Fraunces (display)
- **Key Libraries**: expo-linear-gradient, expo-av, expo-haptics, expo-notifications

### Backend (Express + Node.js)

- **Runtime**: Express 4, TypeScript (ts-node for dev)
- **ORM**: Prisma with PostgreSQL
- **AI**: OpenAI API (via Replit AI Integrations)
- **Key Endpoints**:
  - `GET /api/character` — Get character state
  - `POST /api/character/level-up` — Level up character
  - `POST /api/auth/login` — User authentication
  - `POST /api/ai-coach/chat` — AI coach message
  - `GET /api/quests` — Daily quests list
  - `POST /api/quests/:id/complete` — Complete quest (awards Zen Coins)

### Database

- **Database**: PostgreSQL (Replit provisioned)
- **ORM**: Prisma ORM
- **Schema**: `users`, `characters`, `quests`, `questCompletions`, `conversations`, `messages`

### Build & Deployment

- **Dev**: Two workflows — `Start Backend` (Express port 5000) + `Start Frontend` (Expo web port 8081)
- **Environment**: DATABASE_URL, OPENAI_API_KEY (via Replit Secrets)

## Recent Changes (Mar 2026)

- Complete app redesign from Maumi → Zenny
- New dark premium aesthetic (deep navy + aurora gradients)
- 5 Zenny character types with pixel art style
- Bilingual EN/KO support with language toggle
- Restructured as monorepo (`apps/mobile` + `apps/api`)
- New screens: AI Coach, Meditation, Quest, Shop
- Zustand state management with character store
- Fraunces + DM Sans typography system
- Zen Coins economy (earned via quests and check-ins)

## Planned Next Steps

- Payment integration via RevenueCat
- Real meditation audio tracks
- Push notification system
- Character skin/accessory rendering
- Social features (friend comparison)
