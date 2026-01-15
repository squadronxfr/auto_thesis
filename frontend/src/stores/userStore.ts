import { create } from 'zustand';

interface UserState {
    id: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatarUrl?: string;
    setUser: (user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        avatarUrl?: string;
    }) => void;
    clearUser: () => void;
}

export const useAuthStore = create<UserState>()((set) => ({
    id: null,
    email: null,
    first_name: null,
    last_name: null,
    phone: null,
    avatarUrl: undefined,
    setUser: (user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        avatarUrl?: string;
    }) =>
        set(() => ({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        })),
    clearUser: () =>
        set(() => ({
            id: null,
            first_name: null,
            last_name: null,
            email: null,
            phone: null,
            avatarUrl: undefined,
        })),
}));
