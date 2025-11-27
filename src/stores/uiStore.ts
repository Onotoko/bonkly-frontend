import { create } from 'zustand';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

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
    globalLoadingMessage: string | null;
    setGlobalLoading: (loading: boolean, message?: string) => void;

    // Modal state
    activeModal: string | null;
    modalData: Record<string, unknown> | null;
    openModal: (modalId: string, data?: Record<string, unknown>) => void;
    closeModal: () => void;

    // Bottom sheet state
    activeSheet: string | null;
    sheetData: Record<string, unknown> | null;
    openSheet: (sheetId: string, data?: Record<string, unknown>) => void;
    closeSheet: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
    // Toast state
    toasts: [],

    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: ToastData = { ...toast, id };
        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        // Auto remove after duration (default 5s)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    // Helper methods
    showSuccess: (title, message) => {
        get().addToast({ type: 'success', title, message });
    },

    showError: (title, message) => {
        get().addToast({ type: 'error', title, message, duration: 7000 });
    },

    showWarning: (title, message) => {
        get().addToast({ type: 'warning', title, message });
    },

    showInfo: (title, message) => {
        get().addToast({ type: 'info', title, message });
    },

    // Global loading
    isGlobalLoading: false,
    globalLoadingMessage: null,

    setGlobalLoading: (isGlobalLoading, message) =>
        set({
            isGlobalLoading,
            globalLoadingMessage: message ?? null,
        }),

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

    // Bottom sheet state
    activeSheet: null,
    sheetData: null,

    openSheet: (sheetId, data = {}) =>
        set({
            activeSheet: sheetId,
            sheetData: data,
        }),

    closeSheet: () =>
        set({
            activeSheet: null,
            sheetData: null,
        }),
}));