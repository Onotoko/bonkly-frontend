import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { PurchaseCreditsRequest } from '../../types/api';

/**
 * Get available credit packages
 */
export const useCreditPackages = () => {
    return useQuery({
        queryKey: queryKeys.credits.packages(),
        queryFn: () => creditService.getPackages(),
        staleTime: 10 * 60 * 1000,
    });
};

/**
 * Get current user's credit balance
 */
export const useCreditBalance = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.credits.balance(),
        queryFn: () => creditService.getBalance(),
        enabled: isAuthenticated,
    });
};

/**
 * Get credit transaction history
 */
export const useCreditHistory = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.credits.history(),
        queryFn: ({ pageParam = 1 }) =>
            creditService.getHistory({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.pagination.page < last.pagination.totalPages
                ? last.pagination.page + 1
                : undefined,
        enabled: isAuthenticated,
    });
};

/**
 * Purchase credits with BONK
 */
export const usePurchaseCredits = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: PurchaseCreditsRequest) => creditService.purchase(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.credits.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.credits.history() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.user.balances() });
        },
    });
};