import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TempData } from '../types/api';

interface AuthState {
    // State
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    tempData: TempData | null; // For incomplete signup (OAuth data before referral)
    isAuthenticated: boolean;
    isLoading: boolean;

    // Computed
    isActivated: boolean;
    needsActivation: boolean;

    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setTempData: (tempData: TempData) => void;
    clearTempData: () => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            accessToken: null,
            refreshToken: null,
            tempData: null,
            isAuthenticated: false,
            isLoading: true,
            depositAddress: null,

            // Computed getters
            get isActivated() {
                return get().user?.isActivated ?? false;
            },
            get needsActivation() {
                return get().isAuthenticated && !get().user?.isActivated;
            },

            // Actions
            setAuth: (user, accessToken, refreshToken,) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    tempData: null,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            setUser: (user) => set({ user }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            setTempData: (tempData) => set({ tempData }),

            clearTempData: () => set({ tempData: null }),

            setLoading: (isLoading) => set({ isLoading }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    tempData: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),
        }),
        {
            name: 'bonkly-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                tempData: state.tempData,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);