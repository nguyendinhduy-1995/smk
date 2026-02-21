import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    phone: string;
    email: string | null;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    fetchMe: () => Promise<void>;
    login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,

    fetchMe: async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                set({ user: data.user, loading: false });
            } else {
                set({ user: null, loading: false });
            }
        } catch {
            set({ user: null, loading: false });
        }
    },

    login: async (phone, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                set({ user: data.user });
                return { success: true };
            }
            return { success: false, error: data.error || 'Đăng nhập thất bại' };
        } catch {
            return { success: false, error: 'Lỗi kết nối' };
        }
    },

    register: async (name, phone, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                set({ user: data.user });
                return { success: true };
            }
            return { success: false, error: data.error || 'Đăng ký thất bại' };
        } catch {
            return { success: false, error: 'Lỗi kết nối' };
        }
    },

    logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null });
    },
}));
