import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { PaginatedResponse, RewardHistoryItem } from '../../types/api';

export const usePendingRewards = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.rewards.pending(),
        queryFn: () => rewardService.getPending(),
        enabled: isAuthenticated,
        refetchInterval: 60 * 1000,
    });
};

export const useRewardHistory = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.rewards.history(),
        queryFn: ({ pageParam = 1 }) => rewardService.getHistory({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<RewardHistoryItem>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    });
};

export const useClaimRewards = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => rewardService.claim(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.rewards.pending() });
            qc.invalidateQueries({ queryKey: queryKeys.rewards.history() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};