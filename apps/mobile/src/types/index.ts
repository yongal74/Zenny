// ============================================================
// Zenny — Shared TypeScript Types
// ============================================================

// ─── Language ───────────────────────────────────────────────
export type Language = 'en' | 'ko';

// ─── Character ──────────────────────────────────────────────
export type CharacterType = 'hana' | 'sora' | 'tora' | 'mizu' | 'kaze';

export interface Character {
    userId: string;
    characterType: CharacterType;
    level: number; // 1-7
    exp: number;
    hunger: number; // 0-100
    mood: number; // 0-100
    equippedSkin: string;
    equippedItems: EquippedItems;
    ownedItems: string[];
    bgTheme: string;
    lastFedAt: string;
}

export interface EquippedItems {
    hat?: string;
    face?: string;
    body?: string;
    bg?: string;
    pet?: string;
}

export const CHARACTER_LEVEL_NAMES: Record<number, Record<Language, string>> = {
    1: { en: 'Seed', ko: '씨앗' },
    2: { en: 'Sprout', ko: '새싹' },
    3: { en: 'Blossom', ko: '꽃봉오리' },
    4: { en: 'Awakened', ko: '각성' },
    5: { en: 'Meditator', ko: '명상자' },
    6: { en: 'Practitioner', ko: '수련자' },
    7: { en: 'Sage', ko: '현자' },
};

export const CHARACTER_EXP_THRESHOLDS: Record<number, number> = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 800,
    6: 1200,
    7: 2000,
};

// ─── Shop Items ─────────────────────────────────────────────
export type ItemType = 'accessory' | 'skin' | 'character';
export type ItemSlot = 'hat' | 'face' | 'body' | 'skin' | 'bg' | 'pet';
export type ItemRarity = 'common' | 'rare' | 'legendary';

export interface ShopItem {
    id: string;
    name: string;
    type: ItemType;
    slot: ItemSlot;
    category: string;
    price: number;
    rarity: ItemRarity;
    imageUrl: string;
    bgTheme?: string;
    levelRequired: number;
    owned: boolean;
    equipped: boolean;
}

// Coin prices by rarity
export const ITEM_PRICE_RANGES: Record<ItemRarity, { min: number; max: number }> = {
    common: { min: 1000, max: 2000 },
    rare: { min: 3000, max: 5000 },
    legendary: { min: 5000, max: 15000 },
};

// ─── Emotion ─────────────────────────────────────────────────
export type Emotion =
    | 'happy' | 'anxious' | 'tired' | 'stressed' | 'sad' | 'angry'
    | 'calm' | 'excited' | 'lonely' | 'grateful' | 'confused';

export const EMOTION_LABELS: Record<Emotion, Record<Language, string>> = {
    happy: { en: '😊 Happy', ko: '😊 행복해요' },
    anxious: { en: '😰 Anxious', ko: '😰 불안해요' },
    tired: { en: '😴 Tired', ko: '😴 피곤해요' },
    stressed: { en: '😤 Stressed', ko: '😤 스트레스' },
    sad: { en: '😢 Sad', ko: '😢 슬퍼요' },
    angry: { en: '😡 Angry', ko: '😡 화나요' },
    calm: { en: '😌 Calm', ko: '😌 평온해요' },
    excited: { en: '🤩 Excited', ko: '🤩 설레요' },
    lonely: { en: '🥺 Lonely', ko: '🥺 외로워요' },
    grateful: { en: '🙏 Grateful', ko: '🙏 감사해요' },
    confused: { en: '🤷 Not sure', ko: '🤷 모르겠어요' },
};

// ─── Chat / CUI ──────────────────────────────────────────────
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    quickReplies?: QuickReply[];
}

export interface QuickReply {
    id: string;
    label: string;
    emotion?: Emotion;
}

export interface ChatSession {
    sessionId: string;
    messages: ChatMessage[];
    turnCount: number;
}

// ─── Meditation Track ─────────────────────────────────────────
export type TrackType = 'breathing' | 'bodyscan' | 'guided' | 'nature';

export interface MeditationTrack {
    id: string;
    title: string;
    type: TrackType;
    emotion?: Emotion;
    audioUrl: string;
    musicUrl?: string;
    duration: number; // seconds
    lang: Language;
    weekCreated: string;
}

// ─── Coin Economy ─────────────────────────────────────────────
export const COIN_REWARDS = {
    emotionCheckin: 15,
    questComplete: 50,
    meditationComplete: 20,
    breathingComplete: 10,
    weeklyQuest: 150,
    streakBonus: (streak: number): number => Math.min(streak * 5, 100),
};

// ─── Quest ────────────────────────────────────────────────────
export type QuestType = 'daily' | 'weekly';

export interface Quest {
    id: string;
    type: QuestType;
    title: string;
    description: string;
    reward: { coins: number; exp: number };
    completedAt?: string;
    progress?: number;
    target?: number;
}
