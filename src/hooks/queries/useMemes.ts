import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memeService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { CreateMemeRequest, Meme, MemeListResponse } from '../../types/api';

const getNextPage = (lastPage: MemeListResponse) =>
    lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;

// Helper to update meme in infinite query cache
const updateMemeInFeed = (
    qc: ReturnType<typeof useQueryClient>,
    queryKey: readonly unknown[],
    memeId: string,
    updater: (meme: Meme) => Meme
) => {
    qc.setQueryData<{ pages: MemeListResponse[]; pageParams: number[] }>(
        queryKey,
        (old) => {
            if (!old) return old;
            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    memes: page.memes.map((meme) =>
                        meme.id === memeId ? updater(meme) : meme
                    ),
                })),
            };
        }
    );
};

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

export const useFeedNew = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedNew(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getFeedNew({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

export const useFeedTrending = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedTrending(),
        queryFn: ({ pageParam = 1 }) =>
            memeService.getFeedTrending({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

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
 * Toggle love on meme (optimistic update for ALL feeds)
 */
export const useLoveMeme = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => memeService.love(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await qc.cancelQueries({ queryKey: queryKeys.memes.feedTrending() });
            await qc.cancelQueries({ queryKey: queryKeys.memes.feedNew() });
            await qc.cancelQueries({ queryKey: queryKeys.memes.feedForYou() });

            // Updater function
            const toggleLove = (meme: Meme): Meme => ({
                ...meme,
                hasLoved: !meme.hasLoved,
                loveCount: meme.hasLoved ? meme.loveCount - 1 : meme.loveCount + 1,
            });

            // Update all feeds optimistically
            updateMemeInFeed(qc, queryKeys.memes.feedTrending(), id, toggleLove);
            updateMemeInFeed(qc, queryKeys.memes.feedNew(), id, toggleLove);
            updateMemeInFeed(qc, queryKeys.memes.feedForYou(), id, toggleLove);

            // Also update detail if cached
            const prevDetail = qc.getQueryData<Meme>(queryKeys.memes.detail(id));
            if (prevDetail) {
                qc.setQueryData(queryKeys.memes.detail(id), toggleLove(prevDetail));
            }

            return { id };
        },
        onError: (_, id) => {
            // Refetch on error to get correct state
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedTrending() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedNew() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedForYou() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(id) });
        },
    });
};

/**
 * Laugh at meme (optimistic update)
 */
export const useLaughMeme = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, sliderPercentage }: { id: string; sliderPercentage: number }) =>
            memeService.laugh(id, { sliderPercentage }),
        onMutate: async ({ id }) => {
            const toggleLaugh = (meme: Meme): Meme => ({
                ...meme,
                hasLaughed: true,
                laughCount: meme.laughCount + 1,
            });

            updateMemeInFeed(qc, queryKeys.memes.feedTrending(), id, toggleLaugh);
            updateMemeInFeed(qc, queryKeys.memes.feedNew(), id, toggleLaugh);
            updateMemeInFeed(qc, queryKeys.memes.feedForYou(), id, toggleLaugh);
        },
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(id) });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
            qc.invalidateQueries({ queryKey: queryKeys.user.balances() });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedTrending() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedNew() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedForYou() });
        },
    });
};

/**
 * Toggle save meme (optimistic update for ALL feeds)
 */
export const useToggleSaveMeme = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => memeService.toggleSave(id),
        onMutate: async (id) => {
            const toggleSave = (meme: Meme): Meme => ({
                ...meme,
                hasSaved: !meme.hasSaved,
            });

            updateMemeInFeed(qc, queryKeys.memes.feedTrending(), id, toggleSave);
            updateMemeInFeed(qc, queryKeys.memes.feedNew(), id, toggleSave);
            updateMemeInFeed(qc, queryKeys.memes.feedForYou(), id, toggleSave);

            const prevDetail = qc.getQueryData<Meme>(queryKeys.memes.detail(id));
            if (prevDetail) {
                qc.setQueryData(queryKeys.memes.detail(id), toggleSave(prevDetail));
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.saved() });
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedTrending() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedNew() });
            qc.invalidateQueries({ queryKey: queryKeys.memes.feedForYou() });
        },
    });
};

export const useSearchMemes = (query: string, limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.search(query),
        queryFn: ({ pageParam = 1 }) =>
            memeService.search(query, { page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
        enabled: query.length >= 2,
    });
};

export const useTrendingTags = (limit = 10) => {
    return useQuery({
        queryKey: queryKeys.memes.trendingTags(),
        queryFn: () => memeService.getTrendingTags(limit),
        staleTime: 5 * 60 * 1000,
    });
};