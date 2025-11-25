import { api } from './api';

import type {
    PaginatedResponse,
    FeedParams, PendingRewards,
    ClaimRewardsResponse,
    RewardHistoryItem
} from '../types/api';
import { buildQuery } from '../utils/query';

export const rewardService = {
    getPending: () => api.get<PendingRewards>('/rewards/pending'),

    claim: () => api.post<ClaimRewardsResponse>('/rewards/claim'),

    getHistory: (params?: FeedParams) =>
        api.get<PaginatedResponse<RewardHistoryItem>>(`/rewards/history${buildQuery(params)}`),
};