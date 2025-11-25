import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { PurchaseCreditsRequest, PaginatedResponse, CreditHistoryItem } from '../../types/api';

export const useCreditPackages = () => {
    return useQuery({
        queryKey: queryKeys.credits.packages(),
        queryFn: () => creditService.getPackages(),
        staleTime: 10 * 60 * 1000,
    });
};

export const useCreditBalance = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.credits.balance(),
        queryFn: () => creditService.getBalance(),
        enabled: isAuthenticated,
    });
};

export const useCreditHistory = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.credits.history(),
        queryFn: ({ pageParam = 1 }) => creditService.getHistory({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<CreditHistoryItem>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    });
};

export const usePurchaseCredits = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: PurchaseCreditsRequest) => creditService.purchase(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.credits.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.credits.history() });
        },
    });
};