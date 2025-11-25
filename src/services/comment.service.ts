import { api } from './api';
import type { Comment, CreateCommentRequest, PaginatedResponse, FeedParams } from '../types/api';
import { buildQuery } from '../utils/query';


export const commentService = {
    create: (memeId: string, data: CreateCommentRequest) =>
        api.post<Comment>(`/memes/${memeId}/comments`, data),

    getByMeme: (memeId: string, params?: FeedParams) =>
        api.get<PaginatedResponse<Comment>>(`/memes/${memeId}/comments${buildQuery(params)}`, false),

    delete: (id: string) => api.delete<void>(`/comments/${id}`),

    like: (id: string) => api.post<{ liked: boolean; likeCount: number }>(`/comments/${id}/like`),

    unlike: (id: string) => api.delete<{ liked: boolean; likeCount: number }>(`/comments/${id}/like`),

    getReplies: (id: string, params?: FeedParams) =>
        api.get<PaginatedResponse<Comment>>(`/comments/${id}/replies${buildQuery(params)}`, false),
};