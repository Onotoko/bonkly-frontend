import { api } from './api';
import type {
    Meme,
    CreateMemeRequest,
    LaughRequest,
    LaughResponse,
    PaginatedResponse,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';


export const memeService = {
    create: (data: CreateMemeRequest) => api.post<Meme>('/memes', data),

    getById: (id: string) => api.get<Meme>(`/memes/${id}`, false),

    delete: (id: string) => api.delete<void>(`/memes/${id}`),

    love: (id: string) => api.post<{ loved: boolean; loveCount: number }>(`/memes/${id}/love`),

    laugh: (id: string, data: LaughRequest) => api.post<LaughResponse>(`/memes/${id}/laugh`, data),

    save: (id: string) => api.post<{ saved: boolean }>(`/memes/${id}/save`),

    unsave: (id: string) => api.delete<void>(`/memes/${id}/save`),

    // Feeds
    getFeedNew: (params?: FeedParams) =>
        api.get<PaginatedResponse<Meme>>(`/memes/feed/new${buildQuery(params)}`, false),

    getFeedTrending: (params?: FeedParams) =>
        api.get<PaginatedResponse<Meme>>(`/memes/feed/trending${buildQuery(params)}`, false),

    getFeedForYou: (params?: FeedParams) =>
        api.get<PaginatedResponse<Meme>>(`/memes/feed/for-you${buildQuery(params)}`),

    getSaved: (params?: FeedParams) =>
        api.get<PaginatedResponse<Meme>>(`/memes/saved${buildQuery(params)}`),
};