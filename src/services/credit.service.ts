import { api } from './api';
import type {
    CreditPackage,
    CreditBalance,
    PurchaseCreditsRequest,
    PurchaseCreditsResponse,
    CreditTransaction,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';

export const creditService = {
    /**
     * GET /credits/packages
     * Get all available credit packages
     * Note: Backend requires auth for this endpoint
     */
    getPackages: () => api.get<CreditPackage[]>('/credits/packages'),

    /**
     * GET /credits/balance
     * Get current user's credit balance
     */
    getBalance: () => api.get<CreditBalance>('/credits/balance'),

    /**
     * POST /credits/purchase
     * Purchase credits with BONK
     */
    purchase: (data: PurchaseCreditsRequest) =>
        api.post<PurchaseCreditsResponse>('/credits/purchase', data),

    /**
     * GET /credits/history
     * Get credit transaction history
     */
    getHistory: (params?: FeedParams) =>
        api.get<{ transactions: CreditTransaction[]; pagination: PaginationMeta }>(
            `/credits/history${buildQuery(params)}`
        ),
};

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}