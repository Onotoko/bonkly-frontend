import { api } from './api';
import type {
    AuthResponse,
    AppleSignInRequest,
    CompleteSignupRequest,
    ValidateReferralResponse,
    ActivateAccountRequest,
    ActivateResponse,
} from '../types/api';

export const authService = {
    /**
     * Google OAuth - Redirect to Google
     * Frontend should redirect to: GET /api/v1/auth/google
     * This will be handled by browser redirect, not API call
     */
    getGoogleAuthUrl: () => `${import.meta.env.VITE_API_BASE || '/api/v1'}/auth/google`,

    /**
     * Apple Sign In
     * POST /auth/apple-signin
     */
    appleSignIn: (data: AppleSignInRequest) =>
        api.post<AuthResponse>('/auth/apple-signin', data, false),

    /**
     * Validate referral code
     * POST /auth/validate-referral
     */
    validateReferral: (referralCode: string) =>
        api.post<ValidateReferralResponse>('/auth/validate-referral', { referralCode }, false),

    /**
     * Complete signup with referral code
     * POST /auth/complete-signup
     */
    completeSignup: (data: CompleteSignupRequest) =>
        api.post<AuthResponse>('/auth/complete-signup', data, false),

    /**
     * Activate account with BONK deposit
     * POST /auth/activate
     */
    activate: (data: ActivateAccountRequest) =>
        api.post<ActivateResponse>('/auth/activate', data),

    /**
     * Refresh tokens
     * POST /auth/refresh
     */
    refresh: (refreshToken: string) =>
        api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }, false),

    /**
     * Get current user
     * GET /auth/me
     */
    getMe: () => api.get<{ user: AuthUser }>('/auth/me'),

    /**
     * Logout
     * POST /auth/logout
     */
    logout: () => api.post<{ message: string }>('/auth/logout'),
};

// Type for /auth/me response
interface AuthUser {
    id: string;
    email: string;
    username: string;
}