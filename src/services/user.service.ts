// services/user.service.ts

import { api } from './api';
import type {
    UserProfile,
    UserBalances,
    UpdateProfileRequest,
    PublicUserProfile,
} from '../types/api';

export const userService = {
    /**
     * GET /users/profile
     * Get current user's profile
     */
    getProfile: () => api.get<UserProfile>('/users/profile'),

    /**
     * PUT /users/profile
     * Update current user's profile
     */
    updateProfile: (data: UpdateProfileRequest) =>
        api.put<UserProfile>('/users/profile', data),

    /**
     * GET /users/balances
     * Get current user's balances
     */
    getBalances: () => api.get<UserBalances>('/users/balances'),

    /**
     * GET /users/:username
     * Get public profile by username (includes social info)
     */
    getByUsername: (username: string) =>
        api.get<PublicUserProfile>(`/users/${username}`),
};