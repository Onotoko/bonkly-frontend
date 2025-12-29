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
 * Polls every 10s only when there are processing withdrawals
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
        // Smart polling: check if any request is processing
        refetchInterval: (query) => {
            const hasProcessing = query.state.data?.pages.some((page) =>
                page.requests.some(
                    (r: { status?: string }) => r.status === 'processing'
                )
            );
            // Poll every 10s if processing, otherwise don't poll
            return hasProcessing ? 10 * 1000 : false;
        },
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

/**
 * Power up (convert BONK to dBONK)
 */
export const usePowerUp = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { bonkAmount: number }) => walletService.powerUp(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.user.balances() });
        },
    });
};