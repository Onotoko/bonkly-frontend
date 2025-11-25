import { api } from './api';
import type {
    AuthResponse,
    GoogleCallbackRequest,
    AppleCallbackRequest,
    CompleteSignupRequest,
    ValidateReferralResponse,
} from '../types/api';

export const authService = {
    googleCallback: (data: GoogleCallbackRequest) =>
        api.post<AuthResponse>('/auth/google/callback', data, false),

    appleCallback: (data: AppleCallbackRequest) =>
        api.post<AuthResponse>('/auth/apple/callback', data, false),

    validateReferral: (code: string) =>
        api.post<ValidateReferralResponse>('/auth/validate-referral', { code }, false),

    completeSignup: (data: CompleteSignupRequest) =>
        api.post<AuthResponse>('/auth/complete-signup', data, false),

    refresh: (refreshToken: string) =>
        api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }, false),

    logout: () => api.post<void>('/auth/logout'),
};