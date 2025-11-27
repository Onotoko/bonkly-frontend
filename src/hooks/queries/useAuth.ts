import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
import type {
    AppleSignInRequest,
    CompleteSignupRequest,
    ActivateAccountRequest,
} from '../../types/api';

/**
 * Google Login - Redirect based
 * Returns URL to redirect user to Google OAuth
 */
export const useGoogleLogin = () => {
    const handleGoogleLogin = () => {
        window.location.href = authService.getGoogleAuthUrl();
    };
    return { login: handleGoogleLogin };
};

/**
 * Apple Sign In
 */
export const useAppleLogin = () => {
    const { setAuth, setTempData } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: AppleSignInRequest) => authService.appleSignIn(data),
        onSuccess: (res) => {
            if (res.needsReferral && res.tempData) {
                // New user - needs referral code
                setTempData(res.tempData);
            } else if (res.user && res.accessToken && res.refreshToken) {
                // Existing user - logged in
                setAuth(res.user, res.accessToken, res.refreshToken);
                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
            }
        },
    });
};

/**
 * Validate Referral Code
 */
export const useValidateReferral = () => {
    return useMutation({
        mutationFn: (code: string) => authService.validateReferral(code),
    });
};

/**
 * Complete Signup with referral code
 */
export const useCompleteSignup = () => {
    const { setAuth, clearTempData } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CompleteSignupRequest) => authService.completeSignup(data),
        onSuccess: (res) => {
            if (res.user && res.accessToken && res.refreshToken) {
                clearTempData();
                setAuth(res.user, res.accessToken, res.refreshToken);
                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
            }
        },
    });
};

/**
 * Activate Account with BONK deposit
 */
export const useActivateAccount = () => {
    const { setAuth } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: ActivateAccountRequest) => authService.activate(data),
        onSuccess: (res) => {
            setAuth(res.user, res.accessToken, res.refreshToken);
            qc.invalidateQueries({ queryKey: queryKeys.user.me() });
            qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        },
    });
};

/**
 * Logout
 */
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