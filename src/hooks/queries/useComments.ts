import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../../services';
import { queryKeys } from './keys';
import type { CreateCommentRequest, CommentListResponse, Comment } from '../../types/api';

const getNextPage = (lastPage: CommentListResponse) =>
    lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;

// Type for infinite query data
type InfiniteCommentData = {
    pages: CommentListResponse[];
    pageParams: number[];
};

// Helper to update comment in infinite query cache
const updateCommentInCache = (
    qc: ReturnType<typeof useQueryClient>,
    queryKey: readonly unknown[],
    commentId: string,
    updater: (comment: Comment) => Comment
) => {
    qc.setQueryData<InfiniteCommentData>(queryKey, (old) => {
        if (!old) return old;
        return {
            ...old,
            pages: old.pages.map((page) => ({
                ...page,
                comments: page.comments.map((comment) =>
                    comment.id === commentId ? updater(comment) : comment
                ),
            })),
        };
    });
};

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
 * Toggle like on comment - Optimistic update + sync with server response
 */
export const useToggleLikeComment = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId }: { commentId: string; memeId: string; parentCommentId?: string }) =>
            commentService.toggleLike(commentId),

        onMutate: async ({ commentId, memeId, parentCommentId }) => {
            // Cancel outgoing refetches
            await qc.cancelQueries({ queryKey: queryKeys.comments.byMeme(memeId) });
            if (parentCommentId) {
                await qc.cancelQueries({ queryKey: queryKeys.comments.replies(parentCommentId) });
            }

            // Snapshot previous value
            const prevComments = qc.getQueryData<InfiniteCommentData>(queryKeys.comments.byMeme(memeId));
            const prevReplies = parentCommentId
                ? qc.getQueryData<InfiniteCommentData>(queryKeys.comments.replies(parentCommentId))
                : undefined;

            // Optimistic update
            const toggleLike = (comment: Comment): Comment => ({
                ...comment,
                hasLiked: !comment.hasLiked,
                likeCount: comment.hasLiked ? comment.likeCount - 1 : comment.likeCount + 1,
            });

            updateCommentInCache(qc, queryKeys.comments.byMeme(memeId), commentId, toggleLike);
            if (parentCommentId) {
                updateCommentInCache(qc, queryKeys.comments.replies(parentCommentId), commentId, toggleLike);
            }

            return { prevComments, prevReplies, memeId, parentCommentId };
        },

        onError: (_, __, context) => {
            // Rollback on error
            if (context?.prevComments) {
                qc.setQueryData(queryKeys.comments.byMeme(context.memeId), context.prevComments);
            }
            if (context?.prevReplies && context?.parentCommentId) {
                qc.setQueryData(queryKeys.comments.replies(context.parentCommentId), context.prevReplies);
            }
        },

        onSuccess: (data, { commentId, memeId, parentCommentId }) => {
            // Sync with server response - update to actual values
            const syncWithServer = (comment: Comment): Comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        hasLiked: data.liked,
                        likeCount: data.likeCount,
                    };
                }
                return comment;
            };

            updateCommentInCache(qc, queryKeys.comments.byMeme(memeId), commentId, syncWithServer);
            if (parentCommentId) {
                updateCommentInCache(qc, queryKeys.comments.replies(parentCommentId), commentId, syncWithServer);
            }
        },
    });
};