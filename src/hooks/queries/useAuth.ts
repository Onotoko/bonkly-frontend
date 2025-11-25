import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type { GoogleCallbackRequest, AppleCallbackRequest, CompleteSignupRequest } from '../../types/api';

export const useGoogleLogin = () => {
    const { setAuth, setTempToken } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: GoogleCallbackRequest) => authService.googleCallback(data),
        onSuccess: (res) => {
            if (res.tempToken) {
                setTempToken(res.tempToken);
            } else {
                setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
            }
        },
    });
};

export const useAppleLogin = () => {
    const { setAuth, setTempToken } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: AppleCallbackRequest) => authService.appleCallback(data),
        onSuccess: (res) => {
            if (res.tempToken) {
                setTempToken(res.tempToken);
            } else {
                setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
            }
        },
    });
};

export const useCompleteSignup = () => {
    const { setAuth, clearTempToken } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CompleteSignupRequest) => authService.completeSignup(data),
        onSuccess: (res) => {
            clearTempToken();
            setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
            qc.invalidateQueries({ queryKey: queryKeys.user.me() });
        },
    });
};

export const useValidateReferral = () => {
    return useMutation({
        mutationFn: (code: string) => authService.validateReferral(code),
    });
};

export const useLogout = () => {
    const { logout } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSettled: () => {
            logout();
            qc.clear();
        },
    });
};