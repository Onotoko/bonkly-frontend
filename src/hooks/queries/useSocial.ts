import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { FollowListResponse } from '../../types/api';

const getNextPage = (lastPage: FollowListResponse) =>
    lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;

/**
 * Get user's followers
 */
export const useFollowers = (username: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.social.followers(username),
        queryFn: ({ pageParam = 1 }) =>
            socialService.getFollowers(username, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!username,
    });
};

/**
 * Get user's following list
 */
export const useFollowing = (username: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.social.following(username),
        queryFn: ({ pageParam = 1 }) =>
            socialService.getFollowing(username, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!username,
    });
};

/**
 * Check if current user is following target user
 */
export const useIsFollowing = (username: string) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.social.isFollowing(username),
        queryFn: () => socialService.isFollowing(username),
        enabled: !!username && isAuthenticated,
    });
};

/**
 * Follow a user
 */
export const useFollow = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => socialService.follow(username),
        onSuccess: (_, username) => {
            qc.invalidateQueries({ queryKey: queryKeys.social.isFollowing(username) });
            qc.invalidateQueries({ queryKey: queryKeys.user.byUsername(username) });
            qc.invalidateQueries({ queryKey: queryKeys.social.followers(username) });
        },
    });
};

/**
 * Unfollow a user
 */
export const useUnfollow = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => socialService.unfollow(username),
        onSuccess: (_, username) => {
            qc.invalidateQueries({ queryKey: queryKeys.social.isFollowing(username) });
            qc.invalidateQueries({ queryKey: queryKeys.user.byUsername(username) });
            qc.invalidateQueries({ queryKey: queryKeys.social.followers(username) });
        },
    });
};