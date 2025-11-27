import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type {
    WithdrawRequest,
    WithdrawConfirmRequest,
    PowerDownStartRequest,
    PowerDownHistoryResponse,
} from '../../types/api';

/**
 * Get wallet balance
 */
export const useWalletBalance = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.wallet.balance(),
        queryFn: () => walletService.getBalance(),
        enabled: isAuthenticated,
        refetchInterval: 30 * 1000,
    });
};

/**
 * Get transactions history
 */
export const useTransactions = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.wallet.transactions(),
        queryFn: ({ pageParam = 1 }) =>
            walletService.getTransactions({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.pagination.page < last.pagination.totalPages
                ? last.pagination.page + 1
                : undefined,
        enabled: isAuthenticated,
    });
};

// ============ Withdrawal ============

/**
 * Request withdrawal (step 1)
 */
export const useRequestWithdraw = () => {
    return useMutation({
        mutationFn: (data: WithdrawRequest) => walletService.requestWithdraw(data),
    });
};

/**
 * Confirm withdrawal with SOL fee payment (step 2)
 */
export const useConfirmWithdraw = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: WithdrawConfirmRequest) => walletService.confirmWithdraw(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.withdrawRequests() });
        },
    });
};

/**
 * Cancel withdrawal request
 */
export const useCancelWithdraw = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (requestId: string) => walletService.cancelWithdraw(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.withdrawRequests() });
        },
    });
};

/**
 * Get withdrawal requests
 */
export const useWithdrawRequests = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.wallet.withdrawRequests(),
        queryFn: ({ pageParam = 1 }) =>
            walletService.getWithdrawRequests({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.pagination.page < last.pagination.totalPages
                ? last.pagination.page + 1
                : undefined,
        enabled: isAuthenticated,
    });
};

// ============ Power Down ============

/**
 * Get active power down status
 */
export const usePowerDownStatus = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.wallet.powerDownStatus(),
        queryFn: () => walletService.getPowerDownStatus(),
        enabled: isAuthenticated,
    });
};

/**
 * Get power down history
 */
export const usePowerDownHistory = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.wallet.powerDownHistory(),
        queryFn: ({ pageParam = 1 }) =>
            walletService.getPowerDownHistory({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PowerDownHistoryResponse) =>
            last.pagination.page < last.pagination.totalPages
                ? last.pagination.page + 1
                : undefined,
        enabled: isAuthenticated,
    });
};

/**
 * Start power down
 */
export const useStartPowerDown = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: PowerDownStartRequest) => walletService.startPowerDown(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.powerDownStatus() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};

/**
 * Cancel power down
 */
export const useCancelPowerDown = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => walletService.cancelPowerDown(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.powerDownStatus() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.powerDownHistory() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};