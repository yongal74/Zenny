# replit.md

## Overview

This is a **digital mental care app** (working title: "AI 시대의 무의식" / "AI Era's Unconscious") built as a cross-platform mobile application using Expo (React Native) with an Express backend. The core concept is a Tamagotchi-style virtual character that acts as a "mirror self" — reflecting the user's real-time psychological state through visual changes. Users record emotions and feelings, complete wellness quests (breathing exercises, gratitude journaling, etc.), and chat with an AI companion. The character evolves and grows based on the user's emotional engagement and mental health activities.

The app is primarily in Korean and targets mental wellness through gamified CBT (Cognitive Behavioral Therapy) techniques, structured emotion/feeling logging, and AI-powered conversational support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture
- **Routing**: Expo Router v6 with file-based routing (`app/` directory), typed routes enabled
- **State Management**: TanStack React Query for server state; local component state with React hooks
- **Navigation**: Tab-based layout with 5 tabs:
  - `index` (홈/Home) — Character display with mood visualization and animated character
  - `log` — Emotion and feeling recording with structured input (emotions, body sensations, detailed journaling)
  - `breathe` — Guided breathing exercises and wellness quests
  - `chat` — AI conversational companion
  - `growth` — Character growth stats with radar chart visualization
- **UI**: Custom styling with light/dark theme support via `useColorScheme()`, emotion-specific color palette defined in `constants/colors.ts`
- **Animations**: React Native Reanimated and Animated API for character animations (pulse, float effects)
- **Key Libraries**: react-native-gesture-handler, react-native-keyboard-controller, react-native-svg, expo-blur, expo-haptics

### Backend (Express + Node.js)

- **Runtime**: Express 5 on Node.js, written in TypeScript (compiled with tsx for dev, esbuild for production)
- **API Pattern**: RESTful JSON APIs under `/api/` prefix
- **Key Endpoints**:
  - `GET /api/character` — Get or create default user's character
  - `POST /api/emotions` — Log emotion check-in (awards 20 XP)
  - `POST /api/feelings` — Log feeling/body sensation (awards 25 XP)
  - `POST /api/chat` — AI chat with OpenAI integration
  - `POST /api/quests/:type/complete` — Complete wellness quests (awards variable XP)
  - `GET /api/growth-data` — Fetch character growth statistics
  - `GET /api/emotion-history` — Retrieve emotion log history
- **CORS**: Dynamic origin-based CORS handling supporting Replit domains and localhost
- **Static Serving**: In production, serves pre-built Expo web bundle; in development, proxies to Metro bundler

### AI Integration

- **Provider**: OpenAI API via Replit AI Integrations (custom base URL)
- **Chat System**: System prompt defines an empathetic Korean-speaking companion that guides emotion/feeling recording using a structured approach (event → emotion → body sensation → pattern)
- **Replit Integration Modules** (in `server/replit_integrations/`):
  - `chat/` — Conversation management with database persistence
  - `audio/` — Speech-to-text, text-to-speech, voice chat capabilities
  - `image/` — Image generation via gpt-image-1
  - `batch/` — Rate-limited batch processing utilities with retry logic

### Database

- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema** (`shared/schema.ts`):
  - `users` — User accounts with personality profiles and onboarding status
  - `characters` — Tamagotchi-style characters with evolution stage, level, XP, mood state, visual state, and multi-dimensional growth metrics (emotion, feeling, stress, spiritual)
  - `emotionLogs` — Timestamped emotion records with intensity values
  - `feelingLogs` — Body sensation and feeling records
  - `quests` — Completed wellness activities
  - `conversations` — Chat conversation threads
  - `messages` — Individual chat messages within conversations
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Schema Validation**: drizzle-zod for generating Zod schemas from Drizzle tables

### Character Growth System

- Characters gain XP from user activities (emotion logging: 20 XP, feeling logging: 25 XP, quests: variable)
- Level = floor(totalExp / 100) + 1
- Evolution stage = min(floor(level / 5) + 1, 5) — 5 evolution stages
- Growth tracked across 4 dimensions: emotion, feeling, stress management, spiritual growth
- Character mood and visual state stored as JSONB for flexible real-time updates

### Build & Deployment

- **Development**: Two parallel processes — Expo dev server (`expo:dev`) and Express server (`server:dev`)
- **Production Build**: Expo static web build + esbuild for server bundling
- **Environment Variables Required**:
  - `DATABASE_URL` — PostgreSQL connection string
  - `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key
  - `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit integration)
  - `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` — For CORS and API URL resolution
  - `EXPO_PUBLIC_DOMAIN` — Client-side API domain

### Path Aliases

- `@/*` → project root
- `@shared/*` → `./shared/*` (shared code between client and server)

## External Dependencies

- **PostgreSQL** — Primary data store (provisioned via Replit)
- **OpenAI API** — Powers AI chat companion, accessible through Replit AI Integrations proxy
- **Replit AI Integrations** — Provides OpenAI-compatible endpoints for chat, image generation, audio (speech-to-text, text-to-speech)
- **Expo Services** — Build tooling and OTA updates infrastructure
- **patch-package** — Applied via postinstall for any dependency patches (check `patches/` directory)