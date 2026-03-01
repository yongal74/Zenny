import axios from 'axios';
import type { ChatMessage, Language, QuickReply } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

// Auth 토큰 인터셉터 (추후 AsyncStorage에서 토큰 읽기)
api.interceptors.request.use((config) => {
    // const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

interface CoachResponse {
    response: string;
    quickReplies?: QuickReply[];
    model: string;
}

/**
 * AI 코치에게 메시지 전송
 */
export async function generateAIResponse(params: {
    message: string;
    lang: Language;
    characterType: string;
    history: ChatMessage[];
    turnCount: number;
}): Promise<CoachResponse> {
    const { data } = await api.post<CoachResponse>('/coach/chat', {
        message: params.message,
        lang: params.lang,
        characterType: params.characterType,
        history: params.history.slice(-10), // 최근 10개만 전송
        turnCount: params.turnCount,
    });
    return data;
}

/**
 * 새 세션 시작 (첫 인사 + quickReplies)
 */
export async function startCoachSession(params: {
    lang: Language;
    characterType: string;
}): Promise<CoachResponse> {
    const { data } = await api.post<CoachResponse>('/coach/session/start', params);
    return data;
}

/**
 * 감정 체크인 (코인 + EXP 지급)
 */
export async function submitEmotionCheckin(params: {
    emotion: string;
    text?: string;
    intensity: number;
}) {
    const { data } = await api.post('/emotion/checkin', params);
    return data;
}
