export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ROUTES = {
    LOGIN: '/login',
    REFERRAL: '/referral',
    DEPOSIT: '/deposit',
    SUCCESS: '/success',
    HOME: '/',
    PROFILE: '/profile',
    EARN: '/earn',
    SETTINGS: '/settings',
    MEME_DETAIL: '/meme/:id',
    CREATE_MEME: '/create',
} as const;

export const TOKENOMICS = {
    ACTIVATION_AMOUNT: 40000, // BONK required
    DBONK_RATIO: 15, // 1 BONK = 15 dBONK
    PLATFORM_FEE_PERCENT: 20,
    POWER_UP_PERCENT: 80,
} as const;