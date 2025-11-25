import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { PaginatedResponse, UserSummary } from '../../types/api';

export const useFollowers = (username: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.social.followers(username),
        queryFn: ({ pageParam = 1 }) => socialService.getFollowers(username, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<UserSummary>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        enabled: !!username,
    });
};

export const useFollowing = (username: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.social.following(username),
        queryFn: ({ pageParam = 1 }) => socialService.getFollowing(username, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<UserSummary>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        enabled: !!username,
    });
};

export const useIsFollowing = (username: string) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.social.isFollowing(username),
        queryFn: () => socialService.isFollowing(username),
        enabled: !!username && isAuthenticated,
    });
};

export const useFollow = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => socialService.follow(username),
        onSuccess: (_, username) => {
            qc.invalidateQueries({ queryKey: queryKeys.social.isFollowing(username) });
            qc.invalidateQueries({ queryKey: queryKeys.user.byUsername(username) });
        },
    });
};

export const useUnfollow = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => socialService.unfollow(username),
        onSuccess: (_, username) => {
            qc.invalidateQueries({ queryKey: queryKeys.social.isFollowing(username) });
            qc.invalidateQueries({ queryKey: queryKeys.user.byUsername(username) });
        },
    });
};