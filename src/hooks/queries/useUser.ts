import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { UpdateProfileRequest } from '../../types/api';

/**
 * Get current user's profile
 */
export const useProfile = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.user.me(),
        queryFn: () => userService.getProfile(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Get current user's balances
 */
export const useBalances = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.user.balances(),
        queryFn: () => userService.getBalances(),
        enabled: isAuthenticated,
        refetchInterval: 30 * 1000,
    });
};

/**
 * Get public profile by username
 */
export const useUserByUsername = (username: string) => {
    return useQuery({
        queryKey: queryKeys.user.byUsername(username),
        queryFn: () => userService.getByUsername(username),
        enabled: !!username,
    });
};

/**
 * Update current user's profile
 */
export const useUpdateProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
        onSuccess: (updatedProfile) => {
            qc.setQueryData(queryKeys.user.me(), updatedProfile);
        },
    });
};