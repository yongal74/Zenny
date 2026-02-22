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
- **Settings** (`app/settings.tsx`) — Push notifications (enable/disable, frequency), shake detection toggle, soul coin rewards info

### Activity Log
- 6 activities in 2 rows of 3: Breathing, Meditation, Gratitude, Drink Water, Stretch, Etc.

### Character Evolution System
- 7 evolution stages per species (35 total images in `assets/characters/{species}_{stage}.png`)
- Evolution based on level: Stage 1 (Lv1-4), Stage 2 (Lv5-9), Stage 3 (Lv10-14), Stage 4 (Lv15-19), Stage 5 (Lv20-24), Stage 6 (Lv25-29), Stage 7 (Lv30+)
- Character visually evolves from baby to divine form
- `getCharacterImage(species, level)` function in index.tsx determines correct image

## Recent Changes (Feb 22, 2026)

- **App Name**: Changed to "Maumi: AI Mental Care Tamagotchi"
- **Character Evolution**: 35 evolution stage images (7 per species x 5 species) with 8-bit pixel art kawaii style
- **Time-based Greetings**: Maumie greets based on time of day (morning/afternoon/evening/night) with random variety
- **Home Menu Expanded**: Added Meditation and Breathing buttons to main chat menu (5 buttons total)
- **Back Buttons**: All screens now use chevron-back icon for consistent navigation
- **Activity Rename**: "1-Min Breath" renamed to "Breathing" in both Home and Journal
- **Soul Coin Purchase**: Coin purchase modal with 4 packages ($0.99-$14.99) and `/api/coins/add` endpoint
- **Onboarding Redesigned**: 6-slide onboarding with bullet points, colored dots, icon circles, better typography
- Activity log: 6 items in 2 rows of 3 (Breathing, Meditation, Gratitude, Drink Water, Stretch, Etc.)
- Shop: 80 items across 8 categories with gradient header
- Meditation music: 12 tracks across 4 categories
- Breathing guide: 5 guided exercises (4-7-8, Box, Energizing, Deep Calm, Sleep)
- Generated 6 base + 35 evolution kawaii character illustrations
- **Settings Screen**: Push notifications (enable/disable, frequency: 30min/1hr/2hr/4hr/8hr), shake detection toggle
- **Shake to Activate**: Shaking phone resets chat to main menu for quick check-in (uses expo-sensors Accelerometer)
- **Soul Coin Rewards**: Emotion log +5 coins, Feeling log +5 coins, Push check-in bonus +10 coins
- **Home Menu Layout**: Row 1 = My Emotions / My Feelings / Just Chat, Row 2 = Meditation (full width), Row 3 = Breathing (full width)
- **App Name**: Changed to "Maumi: AI Mental Care Tamagotchi" — all references updated from "Maumie" to "Maumi"
- **Onboarding Subtitle**: First slide subtitle changed to "AI Mental Care Tamagotchi"
- **Growth Coin Recharge**: "Get Coins" button added to Soul Coins card in Growth tab with coin purchase modal
- **Growth Tab Cleanup**: Removed Meditation Music and Breathing Guide links (accessible from Home menu)
- **Home Spacing**: Added clear spacing between greeting bubble and menu buttons
- **Onboarding Fix**: Fixed onboarding completion loop (AsyncStorage check in _layout.tsx)
- **Web Compatibility**: expo-notifications conditionally loaded (Platform.OS !== "web") to fix web bundle errors

### Planned Next Steps (Tomorrow)
- Payment integration (real purchases for Soul Coins)
- Accessory images for shop items (replace emoji with actual images)
- Character skin/accessory rendering on character
- Back tap option as alternative to shake detection
- More customization items and categories
