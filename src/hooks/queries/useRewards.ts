import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';

/**
 * Get pending rewards summary
 */
export const usePendingRewards = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.rewards.pending(),
        queryFn: () => rewardService.getPending(),
        enabled: isAuthenticated,
        refetchInterval: 60 * 1000,
    });
};

/**
 * Claim all pending rewards
 */
export const useClaimRewards = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => rewardService.claim(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.rewards.pending() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
            qc.invalidateQueries({ queryKey: queryKeys.user.balances() });
        },
    });
};