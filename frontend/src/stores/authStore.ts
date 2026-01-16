// src/stores/authStore.ts
import type { UserDto } from '@/schemas';

import { create } from 'zustand';

interface AuthState {
    user: UserDto | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    setUser: (user: UserDto | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    login: (accessToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    setUser: (user) => set({ user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    login: (token) =>
        set({
            accessToken: token,
            isAuthenticated: true,
        }),
    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
        }),
}));
