import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memeService } from '../../services';
import { queryKeys } from './keys';
import type { CreateMemeRequest, Meme, PaginatedResponse } from '../../types/api';

const getNextPage = (lastPage: PaginatedResponse<Meme>) =>
    lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined;

export const useMeme = (id: string) => {
    return useQuery({
        queryKey: queryKeys.memes.detail(id),
        queryFn: () => memeService.getById(id),
        enabled: !!id,
    });
};

export const useFeedNew = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedNew(),
        queryFn: ({ pageParam = 1 }) => memeService.getFeedNew({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

export const useFeedTrending = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedTrending(),
        queryFn: ({ pageParam = 1 }) => memeService.getFeedTrending({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

export const useFeedForYou = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.feedForYou(),
        queryFn: ({ pageParam = 1 }) => memeService.getFeedForYou({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

export const useSavedMemes = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: queryKeys.memes.saved(),
        queryFn: ({ pageParam = 1 }) => memeService.getSaved({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: getNextPage,
    });
};

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
                    isLoved: !prev.isLoved,
                    loveCount: prev.isLoved ? prev.loveCount - 1 : prev.loveCount + 1,
                });
            }
            return { prev };
        },
        onError: (_, id, ctx) => {
            if (ctx?.prev) qc.setQueryData(queryKeys.memes.detail(id), ctx.prev);
        },
    });
};

export const useLaughMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, amount }: { id: string; amount: number }) => memeService.laugh(id, { amount }),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.detail(id) });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};

export const useSaveMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => memeService.save(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.saved() });
        },
    });
};

export const useUnsaveMeme = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => memeService.unsave(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.memes.saved() });
        },
    });
};