'use client';

import { create } from 'zustand';

interface UIState {
    isMobileMenuOpen: boolean;
    isCartDrawerOpen: boolean;
    isSearchOpen: boolean;
    isFilterOpen: boolean;
    toasts: Toast[];
    // Actions
    toggleMobileMenu: () => void;
    toggleCartDrawer: () => void;
    toggleSearch: () => void;
    toggleFilter: () => void;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
    isMobileMenuOpen: false,
    isCartDrawerOpen: false,
    isSearchOpen: false,
    isFilterOpen: false,
    toasts: [],

    toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
    toggleCartDrawer: () => set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),
    toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
    toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),

    addToast: (toast) => {
        const id = `toast-${++toastId}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));

        // Auto-remove
        const duration = toast.duration ?? 3000;
        setTimeout(() => {
            get().removeToast(id);
        }, duration);
    },

    removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
}));
