import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../../services';
import { queryKeys } from './keys';
import type { CreateCommentRequest, CommentListResponse } from '../../types/api';

const getNextPage = (lastPage: CommentListResponse) =>
    lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;

/**
 * Get comments for meme
 */
export const useComments = (memeId: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.comments.byMeme(memeId),
        queryFn: ({ pageParam = 1 }) =>
            commentService.getByMeme(memeId, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!memeId,
    });
};

/**
 * Get replies for comment
 */
export const useReplies = (commentId: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.comments.replies(commentId),
        queryFn: ({ pageParam = 1 }) =>
            commentService.getReplies(commentId, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!commentId,
    });
};

/**
 * Create comment
 */
export const useCreateComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ memeId, data }: { memeId: string; data: CreateCommentRequest }) =>
            commentService.create(memeId, data),
        onSuccess: (_, { memeId, data }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(memeId) });
            if (data.parentCommentId) {
                qc.invalidateQueries({ queryKey: queryKeys.comments.replies(data.parentCommentId) });
            }
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(memeId) });
        },
    });
};

/**
 * Delete comment
 */
export const useDeleteComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId }: { commentId: string; memeId: string }) =>
            commentService.delete(commentId),
        onSuccess: (_, { memeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(memeId) });
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(memeId) });
        },
    });
};

/**
 * Toggle like on comment
 */
export const useToggleLikeComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId }: { commentId: string; memeId: string }) =>
            commentService.toggleLike(commentId),
        onSuccess: (_, { memeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(memeId) });
        },
    });
};