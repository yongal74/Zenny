# replit.md

## Overview

**Maumie** — A digital mental wellness app for the North American market, built as a cross-platform mobile application using Expo (React Native) with an Express backend. The core concept is a Tamagotchi-style virtual companion that synchronizes with the user's emotional and feeling states in real-time. Users log emotions (psychological states) and feelings (physical body sensations), complete wellness quests, and chat with an AI companion. The character evolves and grows based on the user's engagement.

The app is **English-first**, targeting the North American market with a premium wellness aesthetic (soft lavender/purple gradients, white cards). **Cost minimization is critical** — button-driven flows are used instead of constant AI API calls.

## User Preferences

- Preferred communication style: Simple, everyday language
- User speaks Korean, prefers Korean communication
- Design: Premium wellness aesthetic with soft lavender/purple gradient (#E8DEFF → #F5F1FF), white cards, purple accent (#7C6DC5)
- Conversational UI is the core interaction model — button-driven flows to minimize AI costs
- Character touch = customization (species/skins), NOT chat initiation
- Minimize Replit development and operational costs

## Current State (Feb 2026)

### App Structure — 3 Tabs
1. **Home** (`app/(tabs)/index.tsx`) — Top: Large Tamagotchi character (grows with level), Bottom: Scrollable conversational chat with button-driven flows
2. **Journal** (`app/(tabs)/journal.tsx`) — Activity log, weekly report, stats
3. **Growth** (`app/(tabs)/growth.tsx`) — Speech bubble forest (4-quadrant), chakra 7-level system, Soul Coins, shop & wellness links

### Additional Screens
- **Shop** (`app/shop.tsx`) — Cosmetic items purchasable with Soul Coins
- **Wellness** (`app/wellness.tsx`) — Curated wellness recommendations

### Character System
- 5 species: cloud, star, drop, flame, leaf (+ egg stage for new characters)
- AI-generated kawaii character illustrations in `assets/characters/`
- Character grows visually: base 120px + 4% per level (max 2x)
- XP bar shows progress to next level
- Species selectable via character picker modal (tap character)

### Monetization
- Soul Coins earned via logs (5 for emotions, 5 for feelings, 2.5 for conversations)
- Cosmetic shop items (skins, accessories, backgrounds, species)

### Chakra Growth System
- 7 levels: Root → Sacral → Solar Plexus → Heart → Throat → Third Eye → Crown
- Each with philosophical meaning and associated color

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: Expo Router v6 with file-based routing (`app/` directory)
- **State Management**: TanStack React Query for server state; local component state with React hooks
- **UI**: Custom styling, soft lavender/purple theme defined in `constants/colors.ts`
- **Animations**: React Native Animated API for character pulse/float effects
- **Key Libraries**: react-native-gesture-handler, react-native-keyboard-controller, react-native-svg, expo-blur, expo-haptics, expo-linear-gradient

### Backend (Express + Node.js)

- **Runtime**: Express 5, TypeScript (tsx for dev, esbuild for production)
- **API Pattern**: RESTful JSON APIs under `/api/` prefix
- **Key Endpoints**:
  - `GET /api/character` — Get or create character
  - `POST /api/character/species` — Change character species
  - `POST /api/emotions` — Log emotion check-in (awards 20 XP)
  - `POST /api/feelings` — Log feeling/body sensation (awards 25 XP)
  - `POST /api/conversations` — Create conversation thread
  - `POST /api/conversations/:id/messages` — Send message (streaming AI response)
  - `POST /api/quests/:type/complete` — Complete wellness quest (awards variable XP)
  - `GET /api/growth-data` — Fetch character growth stats
  - `GET /api/emotion-history` — Retrieve emotion log history
  - `GET /api/shop` — List shop items
  - `POST /api/shop/purchase` — Purchase shop item with Soul Coins
  - `GET /api/wellness` — Wellness recommendations

### AI Integration

- **Provider**: OpenAI API via Replit AI Integrations
- **Cost Strategy**: AI only called for free chat when user explicitly chooses "Chat with Maumie" — all other flows are button-driven with no AI calls

### Database

- **Database**: PostgreSQL (Replit provisioned)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema** (`shared/schema.ts`):
  - `users`, `characters`, `emotionLogs`, `feelingLogs`, `quests`, `conversations`, `messages`
- **Migrations**: `drizzle-kit push`

### Character Growth

- XP from activities: emotion log (20 XP), feeling log (25 XP), quests (variable)
- Level = floor(totalExp / 100) + 1
- Evolution stage = min(floor(level / 5) + 1, 5)
- Growth across 4 dimensions: emotion, feeling, stress, spiritual
- Character image scales visually with level (120px base + 4% per level)

### Build & Deployment

- **Dev**: Two workflows — `Start Frontend` (Expo) + `Start Backend` (Express)
- **Production**: Expo static web build + esbuild server bundle
- **Environment**: DATABASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL, SESSION_SECRET

### Path Aliases

- `@/*` → project root
- `@shared/*` → `./shared/*`

### Additional Screens
- **Shop** (`app/shop.tsx`) — 80 items across 8 categories (hat, glasses, sunglasses, clothes, bag, badge, wings, pet) with 10 each
- **Wellness** (`app/wellness.tsx`) — Curated wellness recommendations
- **Meditation** (`app/meditation.tsx`) — Meditation music player with nature/music/ambient/focus categories
- **Breathing** (`app/breathing.tsx`) — Guided breathing exercises (4-7-8, Box, Energizing, Deep Calm, Sleep)
- **Onboarding** (`app/onboarding.tsx`) — 6-slide intro: welcome, emotions/feelings, growth, meditation, deep growth, customization

### Activity Log
- 6 activities in 2 rows of 3: 1-Min Breath, Meditation, Gratitude, Drink Water, Stretch, Etc.

## Recent Changes (Feb 22, 2026)

- Activity log: Removed Look Far Away, Neck & Shoulder, Favorite Song, Open a Window; added Etc.; arranged 6 items in 2 rows of 3
- Shop expanded to 80 items across 8 categories (hats, glasses, sunglasses, clothes, bags, badges, wings, pets)
- Added onboarding flow (6 screens explaining app concept, emotions/feelings, growth, meditation, customization)
- Added meditation music screen with 12 tracks across 4 categories
- Added breathing guide screen with 5 guided exercises (4-7-8, Box, Energizing, Deep Calm, Sleep)
- Growth tab now links to Meditation Music and Breathing Guide
- Redesigned Home screen: large character at top, scrollable chat at bottom
- Character image size increased (120px base, grows with level)
- XP progress bar added below character
- Chat avatar uses character image instead of emoji
- Species picker uses 48x48 character images
- Character default name changed to "Maumie" (English)
- Shop & Wellness screens updated to lavender/purple theme
- Generated 6 kawaii character illustrations (cloud, star, drop, flame, leaf, egg)
