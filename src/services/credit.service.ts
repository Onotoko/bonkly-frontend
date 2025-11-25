import { api } from './api';
import type { PaginatedResponse, FeedParams, CreditPackage, CreditBalance, PurchaseCreditsRequest, CreditHistoryItem } from '../types/api';
import { buildQuery } from '../utils/query';


export const creditService = {
    getPackages: () => api.get<CreditPackage[]>('/credits/packages', false),

    getBalance: () => api.get<CreditBalance>('/credits/balance'),

    purchase: (data: PurchaseCreditsRequest) => api.post<{ success: boolean }>('/credits/purchase', data),

    getHistory: (params?: FeedParams) =>
        api.get<PaginatedResponse<CreditHistoryItem>>(`/credits/history${buildQuery(params)}`),
};