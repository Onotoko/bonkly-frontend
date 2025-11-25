import { api } from './api';
import type { User, UpdateUserRequest, Meme, PaginatedResponse, FeedParams } from '../types/api';
import { buildQuery } from '../utils/query';


export const userService = {
    getMe: () => api.get<User>('/users/me'),

    updateMe: (data: UpdateUserRequest) => api.put<User>('/users/me', data),

    getByUsername: (username: string) => api.get<User>(`/users/${username}`, false),

    getUserMemes: (username: string, params?: FeedParams) =>
        api.get<PaginatedResponse<Meme>>(`/users/${username}/memes${buildQuery(params)}`, false),
};