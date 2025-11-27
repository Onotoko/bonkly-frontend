import { api } from './api';
import type {
    Comment,
    CreateCommentRequest,
    CommentListResponse,
    FeedParams,
} from '../types/api';
import { buildQuery } from '../utils/query';

export const commentService = {
    /**
     * POST /memes/:memeId/comments
     * Create comment on meme
     */
    create: (memeId: string, data: CreateCommentRequest) =>
        api.post<Comment>(`/memes/${memeId}/comments`, data),

    /**
     * GET /memes/:memeId/comments
     * Get comments for meme (public)
     */
    getByMeme: (memeId: string, params?: FeedParams) =>
        api.get<CommentListResponse>(
            `/memes/${memeId}/comments${buildQuery(params)}`,
            false
        ),

    /**
     * GET /comments/:commentId/replies
     * Get replies for comment (public)
     */
    getReplies: (commentId: string, params?: FeedParams) =>
        api.get<CommentListResponse>(
            `/comments/${commentId}/replies${buildQuery(params)}`,
            false
        ),

    /**
     * DELETE /comments/:commentId
     * Delete comment (owner only)
     */
    delete: (commentId: string) =>
        api.delete<{ message: string }>(`/comments/${commentId}`),

    /**
     * POST /comments/:commentId/like
     * Toggle like on comment
     */
    toggleLike: (commentId: string) =>
        api.post<{ liked: boolean; likeCount: number }>(`/comments/${commentId}/like`),
};