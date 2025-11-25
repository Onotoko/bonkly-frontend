import { api } from './api';
import type { UserSummary, FollowResponse, PaginatedResponse, FeedParams } from '../types/api';
import { buildQuery } from '../utils/query';

export const socialService = {
    follow: (username: string) =>
        api.post<FollowResponse>(`/users/${username}/follow`),

    unfollow: (username: string) =>
        api.delete<FollowResponse>(`/users/${username}/follow`),

    getFollowers: (username: string, params?: FeedParams) =>
        api.get<PaginatedResponse<UserSummary>>(`/users/${username}/followers${buildQuery(params)}`, false),

    getFollowing: (username: string, params?: FeedParams) =>
        api.get<PaginatedResponse<UserSummary>>(`/users/${username}/following${buildQuery(params)}`, false),

    isFollowing: (username: string) =>
        api.get<{ isFollowing: boolean }>(`/users/${username}/is-following`),
};