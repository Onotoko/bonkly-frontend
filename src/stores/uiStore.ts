import { create } from 'zustand';
import type { ToastData } from '@/components/ui/Toast';

interface UIState {
    // Toast
    toasts: ToastData[];
    addToast: (toast: Omit<ToastData, 'id'>) => void;
    removeToast: (id: string) => void;

    // Helper methods
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;

    // Global loading
    isGlobalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Bottom sheet / Modal state (optional - for global modals)
    activeModal: string | null;
    modalData: Record<string, unknown> | null;
    openModal: (modalId: string, data?: Record<string, unknown>) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
    // Toast state
    toasts: [],

    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    // Helper methods for common toast types
    showSuccess: (title, message) => {
        get().addToast({ type: 'success', title, message });
    },

    showError: (title, message) => {
        get().addToast({ type: 'error', title, message });
    },

    showWarning: (title, message) => {
        get().addToast({ type: 'warning', title, message });
    },

    showInfo: (title, message) => {
        get().addToast({ type: 'info', title, message });
    },

    // Global loading
    isGlobalLoading: false,
    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

    // Modal state
    activeModal: null,
    modalData: null,

    openModal: (modalId, data = {}) =>
        set({
            activeModal: modalId,
            modalData: data,
        }),

    closeModal: () =>
        set({
            activeModal: null,
            modalData: null,
        }),
}));