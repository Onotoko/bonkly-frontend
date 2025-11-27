import { api } from './api';
import type { ReferralStats, ValidateReferralResponse } from '../types/api';

export const referralService = {
    /**
     * GET /referrals/stats
     * Get current user's referral stats
     */
    getStats: () => api.get<ReferralStats>('/referrals/stats'),

    /**
     * GET /referrals/validate/:code
     * Validate a referral code (public)
     */
    validateCode: (code: string) =>
        api.get<ValidateReferralResponse>(`/referrals/validate/${code}`, false),

    /**
     * GET /referrals/leaderboard
     * Get referral leaderboard (public)
     */
    getLeaderboard: () =>
        api.get<LeaderboardEntry[]>('/referrals/leaderboard', false),
};

interface LeaderboardEntry {
    username: string;
    displayName: string;
    referralCount: number;
}