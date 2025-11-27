import { api } from './api';
import type {
    Meme,
    CreateMemeRequest,
    LaughRequest,
    LaughResponse,
    MemeListResponse,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';

export const memeService = {
    /**
     * POST /memes
     * Create new meme
     */
    create: (data: CreateMemeRequest) => api.post<Meme>('/memes', data),

    /**
     * GET /memes/:id
     * Get meme by ID (public)
     */
    getById: (id: string) => api.get<Meme>(`/memes/${id}`, false),

    /**
     * DELETE /memes/:id
     * Delete meme (owner only)
     */
    delete: (id: string) => api.delete<{ message: string }>(`/memes/${id}`),

    /**
     * POST /memes/:id/love
     * Toggle love on meme
     */
    love: (id: string) =>
        api.post<{ loved: boolean; loveCount: number }>(`/memes/${id}/love`),

    /**
     * POST /memes/:id/laugh
     * Laugh at meme (costs BONK)
     */
    laugh: (id: string, data: LaughRequest) =>
        api.post<LaughResponse>(`/memes/${id}/laugh`, data),

    /**
     * POST /memes/:id/save
     * Toggle save meme
     */
    toggleSave: (id: string) =>
        api.post<{ saved: boolean }>(`/memes/${id}/save`),

    // ============ Feeds ============

    /**
     * GET /memes/feed/new
     * New memes feed (public)
     */
    getFeedNew: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/feed/new${buildQuery(params)}`, false),

    /**
     * GET /memes/feed/trending
     * Trending memes feed (public)
     */
    getFeedTrending: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/feed/trending${buildQuery(params)}`, false),

    /**
     * GET /memes/feed/for-you
     * Personalized feed (requires auth)
     */
    getFeedForYou: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/feed/for-you${buildQuery(params)}`),

    /**
     * GET /memes/saved/list
     * User's saved memes
     */
    getSaved: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/saved/list${buildQuery(params)}`),

    /**
     * GET /memes/user/:username
     * Get user's memes (public)
     */
    getUserMemes: (username: string, params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/user/${username}${buildQuery(params)}`, false),
};