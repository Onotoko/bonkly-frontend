import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/api';

interface AuthState {
    // State
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    tempToken: string | null; // For incomplete signup
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setTempToken: (tempToken: string) => void;
    clearTempToken: () => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial state
            user: null,
            accessToken: null,
            refreshToken: null,
            tempToken: null,
            isAuthenticated: false,
            isLoading: true,

            // Actions
            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    tempToken: null,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            setUser: (user) => set({ user }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            setTempToken: (tempToken) => set({ tempToken }),

            clearTempToken: () => set({ tempToken: null }),

            setLoading: (isLoading) => set({ isLoading }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    tempToken: null,
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
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);