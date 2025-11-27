import { useQuery } from '@tanstack/react-query';
import { referralService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';

/**
 * Get current user's referral stats
 */
export const useReferralStats = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.referrals.stats(),
        queryFn: () => referralService.getStats(),
        enabled: isAuthenticated,
    });
};

/**
 * Validate a referral code (public)
 */
export const useValidateReferralCode = (code: string, enabled = false) => {
    return useQuery({
        queryKey: queryKeys.referrals.validate(code),
        queryFn: () => referralService.validateCode(code),
        enabled: !!code && enabled,
    });
};

/**
 * Get referral leaderboard (public)
 */
export const useReferralLeaderboard = () => {
    return useQuery({
        queryKey: queryKeys.referrals.leaderboard(),
        queryFn: () => referralService.getLeaderboard(),
        staleTime: 5 * 60 * 1000,
    });
};