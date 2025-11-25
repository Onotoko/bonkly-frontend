import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../../services';
import { queryKeys } from './keys';
import type { CreateCommentRequest, PaginatedResponse, Comment } from '../../types/api';

export const useComments = (memeId: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.comments.byMeme(memeId),
        queryFn: ({ pageParam = 1 }) => commentService.getByMeme(memeId, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<Comment>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        enabled: !!memeId,
    });
};

export const useReplies = (commentId: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.comments.replies(commentId),
        queryFn: ({ pageParam = 1 }) => commentService.getReplies(commentId, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (last: PaginatedResponse<Comment>) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        enabled: !!commentId,
    });
};

export const useCreateComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ memeId, data }: { memeId: string; data: CreateCommentRequest }) =>
            commentService.create(memeId, data),
        onSuccess: (_, { memeId, data }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(memeId) });
            if (data.parentId) {
                qc.invalidateQueries({ queryKey: queryKeys.comments.replies(data.parentId) });
            }
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(memeId) });
        },
    });
};

export const useDeleteComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; _memeId: string }) => commentService.delete(id),
        onSuccess: (_, { _memeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(_memeId) });
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(_memeId) });
        },
    });
};

export const useLikeComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; _memeId: string }) => commentService.like(id),
        onSuccess: (_, { _memeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(_memeId) });
        },
    });
};

export const useUnlikeComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; _memeId: string }) => commentService.unlike(id),
        onSuccess: (_, { _memeId }) => {
            qc.invalidateQueries({ queryKey: queryKeys.comments.byMeme(_memeId) });
        },
    });
};