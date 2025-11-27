import { api } from './api';
import type {
    FollowResponse,
    IsFollowingResponse,
    FollowListResponse,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';

export const socialService = {
    /**
     * POST /users/:username/follow
     * Follow a user
     */
    follow: (username: string) =>
        api.post<FollowResponse>(`/users/${username}/follow`),

    /**
     * DELETE /users/:username/unfollow
     * Unfollow a user
     */
    unfollow: (username: string) =>
        api.delete<FollowResponse>(`/users/${username}/unfollow`),

    /**
     * GET /users/:username/followers
     * Get user's followers (public)
     */
    getFollowers: (username: string, params?: FeedParams) =>
        api.get<FollowListResponse>(
            `/users/${username}/followers${buildQuery(params)}`,
            false
        ),

    /**
     * GET /users/:username/following
     * Get user's following list (public)
     */
    getFollowing: (username: string, params?: FeedParams) =>
        api.get<FollowListResponse>(
            `/users/${username}/following${buildQuery(params)}`,
            false
        ),

    /**
     * GET /users/:username/is-following
     * Check if current user follows target user
     */
    isFollowing: (username: string) =>
        api.get<IsFollowingResponse>(`/users/${username}/is-following`),
};