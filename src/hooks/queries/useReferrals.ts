import { useQuery } from '@tanstack/react-query';
import { referralService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';

export const useReferralCode = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.referrals.code(),
        queryFn: () => referralService.getCode(),
        enabled: isAuthenticated,
    });
};

export const useReferralStats = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.referrals.stats(),
        queryFn: () => referralService.getStats(),
        enabled: isAuthenticated,
    });
};