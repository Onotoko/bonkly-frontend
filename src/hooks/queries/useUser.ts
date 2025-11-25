import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { UpdateUserRequest } from '../../types/api';

export const useMe = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return useQuery({
        queryKey: queryKeys.user.me(),
        queryFn: () => userService.getMe(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserByUsername = (username: string) => {
    return useQuery({
        queryKey: queryKeys.user.byUsername(username),
        queryFn: () => userService.getByUsername(username),
        enabled: !!username,
    });
};

export const useUserMemes = (username: string, limit = 20) => {
    return useQuery({
        queryKey: queryKeys.user.memes(username),
        queryFn: () => userService.getUserMemes(username, { limit }),
        enabled: !!username,
    });
};

export const useUpdateMe = () => {
    const qc = useQueryClient();
    const { setUser } = useAuthStore();
    return useMutation({
        mutationFn: (data: UpdateUserRequest) => userService.updateMe(data),
        onSuccess: (user) => {
            setUser(user);
            qc.setQueryData(queryKeys.user.me(), user);
        },
    });
};