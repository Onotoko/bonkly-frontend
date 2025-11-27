import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memeService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { CreateMemeRequest, Meme, MemeListResponse } from '../../types/api';

const getNextPage = (lastPage: MemeListResponse) =>
    lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;

/**
 * Get single meme by ID
 */
export const useMeme = (id: string) => {
    return useQuery({
        queryKey: queryKeys.memes.detail(id),
        queryFn: () => memeService.getById(id),
        enabled: !!id,
    });
};

/**
 * Get user's memes
 */
export const useUserMemes = (username: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.user.memes(username),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getUserMemes(username, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: !!username,
    });
};

// ============ Feeds ============

/**
 * New memes feed
 */
export const useFeedNew = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedNew(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getFeedNew({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

/**
 * Trending memes feed
 */
export const useFeedTrending = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedTrending(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getFeedTrending({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

/**
 * For You personalized feed (requires auth)
 */
export const useFeedForYou = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedForYou(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getFeedForYou({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: isAuthenticated,
    });
};

/**
 * Saved memes
 */
export const useSavedMemes = (limit = 20) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useInfiniteQuery({
        queryKey: queryKeys.memes.saved(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getSaved({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: isAuthenticated,
    });
};

// ============ Mutations ============

/**
 * Create meme
 */
export const useCreateMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMemeRequest) => memeService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedNew() });
            qc.invalidateQueries({ queryKey: queryKeys.user.me() });
        },
    });
};

/**
 * Delete meme
 */
export const useDeleteMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => memeService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.all });
        },
    });
};

/**
 * Toggle love on meme (optimistic update)
 */
export const useLoveMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => memeService.love(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: queryKeys.memes.detail(id) });
            const prev = qc.getQueryData<Meme>(queryKeys.memes.detail(id));
            if (prev) {
                qc.setQueryData(queryKeys.memes.detail(id), {
                    ...prev,
                    hasLoved: !prev.hasLoved,
                    loveCount: prev.hasLoved ? prev.loveCount - 1 : prev.loveCount + 1,
                });
            }
            return { prev };
        },
        onError: (_, id, ctx) => {
            if (ctx?.prev) qc.setQueryData(queryKeys.memes.detail(id), ctx.prev);
        },
        onSettled: (_, __, id) => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(id) });
        },
    });
};

/**
 * Laugh at meme
 */
export const useLaughMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, sliderPercentage }: { id: string; sliderPercentage: number }) =>
            memeService.laugh(id, { sliderPercentage }),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(id) });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.user.balances() });
        },
    });
};

/**
 * Toggle save meme
 */
export const useToggleSaveMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => memeService.toggleSave(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: queryKeys.memes.detail(id) });
            const prev = qc.getQueryData<Meme>(queryKeys.memes.detail(id));
            if (prev) {
                qc.setQueryData(queryKeys.memes.detail(id), {
                    ...prev,
                    hasSaved: !prev.hasSaved,
                });
            }
            return { prev };
        },
        onError: (_, id, ctx) => {
            if (ctx?.prev) qc.setQueryData(queryKeys.memes.detail(id), ctx.prev);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.saved() });
        },
    });
};