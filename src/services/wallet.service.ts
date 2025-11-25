import { api } from './api';
import type {
    WalletBalance,
    ActivateWalletRequest,
    WithdrawRequest,
    WithdrawRequestResponse,
    WithdrawConfirmRequest,
    PowerDownStartRequest,
    PowerDownStatus,
    PowerDownHistoryItem,
    Transaction,
    PaginatedResponse,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';


export const walletService = {
    activate: (data: ActivateWalletRequest) =>
        api.post<{ activated: boolean }>('/wallet/activate', data),

    getBalance: () => api.get<WalletBalance>('/wallet/balance'),

    // Withdrawal flow
    requestWithdraw: (data: WithdrawRequest) =>
        api.post<WithdrawRequestResponse>('/wallet/withdraw/request', data),

    confirmWithdraw: (data: WithdrawConfirmRequest) =>
        api.post<{ success: boolean; txSignature: string }>('/wallet/withdraw/confirm', data),

    // Power down
    startPowerDown: (data: PowerDownStartRequest) =>
        api.post<PowerDownStatus>('/wallet/power-down/start', data),

    cancelPowerDown: () =>
        api.post<{ cancelled: boolean }>('/wallet/power-down/cancel'),

    getPowerDownStatus: () =>
        api.get<PowerDownStatus>('/wallet/power-down/status'),

    getPowerDownHistory: (params?: FeedParams) =>
        api.get<PaginatedResponse<PowerDownHistoryItem>>(`/wallet/power-down/history${buildQuery(params)}`),

    // Transactions
    getTransactions: (params?: FeedParams) =>
        api.get<PaginatedResponse<Transaction>>(`/wallet/transactions${buildQuery(params)}`),
};