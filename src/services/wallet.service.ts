import { api } from './api';
import type {
    WalletBalance,
    WithdrawRequest,
    WithdrawRequestResponse,
    WithdrawConfirmRequest,
    WithdrawConfirmResponse,
    PowerDownStartRequest,
    PowerDownStatus,
    ActivePowerDownResponse,
    CancelPowerDownResponse,
    PowerDownHistoryResponse,
    FeedParams,
    CheckDepositResponse,
} from '../types/api';
import { buildQuery } from '../utils/query';

export const walletService = {
    /**
     * GET /wallet/balance
     */
    getBalance: () => api.get<WalletBalance>('/wallet/balance'),

    /**
     * GET /wallet/transactions
     */
    getTransactions: (params?: FeedParams) =>
        api.get<{ transactions: Transaction[]; pagination: PaginationMeta }>(
            `/wallet/transactions${buildQuery(params)}`
        ),

    // ============ Withdrawal Flow ============

    /**
     * POST /wallet/withdraw/request
     */
    requestWithdraw: (data: WithdrawRequest) =>
        api.post<WithdrawRequestResponse>('/wallet/withdraw/request', data),

    /**
     * POST /wallet/withdraw/confirm
     */
    confirmWithdraw: (data: WithdrawConfirmRequest) =>
        api.post<WithdrawConfirmResponse>('/wallet/withdraw/confirm', data),

    /**
     * DELETE /wallet/withdraw/cancel/:requestId
     */
    cancelWithdraw: (requestId: string) =>
        api.delete<{ success: boolean; message: string; refundedAmount: number }>(
            `/wallet/withdraw/cancel/${requestId}`
        ),

    /**
     * GET /wallet/withdraw/request/:requestId
     */
    getWithdrawRequest: (requestId: string) =>
        api.get<WithdrawRequestResponse>(`/wallet/withdraw/request/${requestId}`),

    /**
     * GET /wallet/withdraw/requests
     */
    getWithdrawRequests: (params?: FeedParams) =>
        api.get<{ requests: WithdrawRequestResponse[]; pagination: PaginationMeta }>(
            `/wallet/withdraw/requests${buildQuery(params)}`
        ),

    // ============ Power Down ============

    /**
     * POST /wallet/power-down/start
     */
    startPowerDown: (data: PowerDownStartRequest) =>
        api.post<PowerDownStatus>('/wallet/power-down/start', data),

    /**
     * DELETE /wallet/power-down/cancel
     */
    cancelPowerDown: () =>
        api.delete<CancelPowerDownResponse>('/wallet/power-down/cancel'),

    /**
     * GET /wallet/power-down/active
     */
    getPowerDownStatus: () =>
        api.get<ActivePowerDownResponse>('/wallet/power-down/active'),

    /**
     * GET /wallet/power-down/history
     */
    getPowerDownHistory: (params?: FeedParams) =>
        api.get<PowerDownHistoryResponse>(`/wallet/power-down/history${buildQuery(params)}`),

    /**
     * GET /wallet/check-deposit
     * Check for pending deposit and auto-activate if found
     */
    checkDeposit: () =>
        api.get<CheckDepositResponse>('/wallet/check-deposit'),
};


// Local types for transactions (inferred from backend)
interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description?: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}