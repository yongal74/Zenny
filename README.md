# Zenny 🌸 — Your Zen Companion

> AI-powered meditation & mindfulness companion with pixel-art characters

## 🗂️ Project Structure

```
Zenny/
├── apps/
│   ├── mobile/          # React Native (Expo SDK 51)
│   │   ├── src/
│   │   │   ├── screens/       # AICoachScreen, HomeScreen, ...
│   │   │   ├── components/    # CharacterDisplay, QuickReplyGrid, CustomizeModal
│   │   │   ├── stores/        # Zustand (characterStore, chatStore)
│   │   │   ├── services/      # coach.service.ts (API 클라이언트)
│   │   │   ├── constants/     # colors.ts (Starlight 테마)
│   │   │   └── types/         # 공통 TypeScript 타입
│   │   └── App.tsx
│   └── api/             # Node.js + Express + Prisma
│       ├── src/
│       │   ├── routes/        # auth, coach, character, shop, quest, emotion, meditation
│       │   ├── services/      # openai.service.ts, redis.service.ts
│       │   └── middleware/    # auth (JWT), error
│       └── prisma/
│           ├── schema.prisma  # 7 테이블 (User, Character, EmotionCheckin, ...)
│           └── seed.ts        # 명상 20개 + 스킨 20종 + 악세사리 80종 + 퀘스트
├── DevArtifacts/
│   └── claude-directives/  # Claude Code 지시서 4개
└── docker-compose.yml      # PostgreSQL + Redis
```

## 🚀 Quick Start

```bash
# 1. Docker (PostgreSQL + Redis)
docker-compose up -d

# 2. 백엔드 세팅
cd apps/api
cp .env.example .env    # API 키 입력
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev             # http://localhost:3000

# 3. 모바일 앱
cd apps/mobile
npm install
expo start
```

## 🎮 Features (Phase B)

| 기능         | 상태    | 설명 |
|-------------|---------|------|
| AI Coach    | ✅ 완료 | GPT-4o-mini, 10턴 압축, EN/KO |
| 캐릭터 5종   | ✅ 완료 | Hana🌸 Sora☁️ Tora🦊 Mizu💧 Kaze🍃, Lv1-7 |
| Lv7 현자    | ✅ 완료 | 레벨업 → Sage 형태 |
| Zen Coins   | ✅ 완료 | 체크인 15coins, 명상 20-50coins |
| 악세사리 80종| ✅ 완료 | Hat/Face/Body/Aura/Pet/Seasonal |
| 스킨 20종   | ✅ 완료 | 각 스킨 → 배경 테마 자동 연동 |
| 명상 트랙   | ✅ 완료 | EN 10 + KO 10 = 20개 초기 제공 |
| Customize Modal| ✅ 완료 | 탭 6개 + 3열 그리드 + 실시간 장착 |

## 💰 Coin Economy

| 행동 | 획득 Coins |
|-----|---------|
| 감정 체크인 | 15 |
| 호흡 명상 | 20 |
| 일반 명상 | 50 |
| 퀘스트 완료 | 15-50 |
| 주간 스트릭 | 150 |

| 아이템 | 가격 |
|-------|------|
| 악세사리 (common) | 1,000-2,000 |
| 악세사리 (rare) | 3,000-5,000 |
| 악세사리 (legendary) | 5,000 |
| 스킨 (rare) | 5,000-7,000 |
| 스킨 (legendary) | 8,000-10,000 |

## 🧠 AI Design

- **기본 모델**: GPT-4o-mini (비용 최적화)
- **심층 분석**: GPT-4o (15턴 초과 시)
- **캐싱**: Redis 5분 TTL (동일 패턴 재활용)
- **압축**: 10턴 초과 시 세션 자동 요약
- **이론 기반**: CBT, MBSR, DMN 신경과학, 불교/스토아 철학, 프라나야마

## 📦 Tech Stack

**Frontend**: React Native · Expo SDK 51 · TypeScript · React Navigation · Zustand · React Query · i18next

**Backend**: Node.js · Express · TypeScript · Prisma · PostgreSQL · Redis · JWT

**AI**: OpenAI GPT-4o-mini/4o · ElevenLabs (음성) · Suno AI (음악) · AWS S3/CloudFront
