import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { ActivateWalletRequest, WithdrawRequest, WithdrawConfirmRequest, PowerDownStartRequest, PaginatedResponse, Transaction, PowerDownHistoryItem } from '../../types/api';

export const useWalletBalance = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.wallet.balance(),
        queryFn: () => walletService.getBalance(),
        enabled: isAuthenticated,
        refetchInterval: 30 * 1000,
    });
};

export const usePowerDownStatus = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.wallet.powerDownStatus(),
        queryFn: () => walletService.getPowerDownStatus(),
        enabled: isAuthenticated,
    });
};

export const usePowerDownHistory = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.wallet.powerDownHistory(),
        queryFn: ({ pageParam = 1 }) => walletService.getPowerDownHistory({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<PowerDownHistoryItem>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    });
};

export const useTransactions = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.wallet.transactions(),
        queryFn: ({ pageParam = 1 }) => walletService.getTransactions({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<Transaction>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    });
};

export const useActivateWallet = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ActivateWalletRequest) => walletService.activate(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.user.me() });
        },
    });
};

export const useRequestWithdraw = () => {
    return useMutation({
        mutationFn: (data: WithdrawRequest) => walletService.requestWithdraw(data),
    });
};

export const useConfirmWithdraw = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: WithdrawConfirmRequest) => walletService.confirmWithdraw(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
        },
    });
};

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

export const useCancelPowerDown = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => walletService.cancelPowerDown(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.wallet.powerDownStatus() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};