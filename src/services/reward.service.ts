import { api } from './api';
import type { PendingRewards, ClaimRewardsResponse } from '../types/api';

export const rewardService = {
    /**
     * GET /rewards/pending
     * Get pending rewards summary
     */
    getPending: () => api.get<PendingRewards>('/rewards/pending'),

    /**
     * POST /rewards/claim
     * Claim all pending rewards
     */
    claim: () => api.post<ClaimRewardsResponse>('/rewards/claim'),
};

// Note: Backend doesn't have /rewards/history endpoint
// History is tracked in wallet transactions