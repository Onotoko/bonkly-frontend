import { api } from './api';
import type {
    Meme,
    CreateMemeRequest,
    LaughRequest,
    LaughResponse,
    MemeListResponse,
    FeedParams,
    TrendingTagsResponse
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
    getById: (id: string) => api.get<Meme>(`/memes/${id}`),

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
        api.get<MemeListResponse>(`/memes/feed/new${buildQuery(params)}`),

    /**
     * GET /memes/feed/trending
     * Trending memes feed (public)
     */
    getFeedTrending: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/feed/trending${buildQuery(params)}`),

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
    getUserMemes: (username: string, params?: UserMemesParams) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.visibility) queryParams.set('visibility', params.visibility);

        const query = queryParams.toString();
        return api.get<MemeListResponse>(`/memes/user/${username}${query ? `?${query}` : ''}`);
    },
    /**
     * Search memes
     * GET /memes/search?q=query&page=1&limit=20
     */
    search: (query: string, params?: FeedParams) =>
        api.get<MemeListResponse>(
            `/memes/search?q=${encodeURIComponent(query)}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}`,

        ),

    /**
     * Get trending tags
     * GET /memes/tags/trending?limit=10
     */
    getTrendingTags: (limit = 10) =>
        api.get<TrendingTagsResponse>(
            `/memes/tags/trending${buildQuery({ limit })}`,
        ),

    /**
     * GET /memes/loved/list
     * User's loved memes
     */
    getLoved: (params?: FeedParams) =>
        api.get<MemeListResponse>(`/memes/loved/list${buildQuery(params)}`),
};