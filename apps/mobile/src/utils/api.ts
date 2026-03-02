/**
 * API Base URL 자동 감지
 * 우선순위: EXPO_PUBLIC_API_URL > Replit 감지 > localhost 폴백
 */
export function getApiBase(): string {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const { hostname, origin } = window.location;
        // Replit 환경: frontend(8081)에서 backend(3000)으로
        if (hostname.includes('repl.co') || hostname.includes('replit.dev')) {
            return origin.replace(':8081', ':3000') + '/api';
        }
    }
    return 'http://localhost:3000/api';
}

export const API_BASE = getApiBase();
