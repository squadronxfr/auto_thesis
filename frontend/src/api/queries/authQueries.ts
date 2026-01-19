import { queryClient } from '@/configs';
import type { AuthResponse } from '@/types';

import { authService } from '@/api';

import { useAuthStore } from '@/stores';

import type { LoginDto, RegisterDto, ResetPasswordDto, UpdatePasswordDto } from '@/schemas';

import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

/**
 * Hook pour l'inscription d'un utilisateur
 * @returns {Object} Mutation pour l'inscription
 */
export const useRegister = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();

    return useMutation({
        mutationFn: async (userData: RegisterDto) => {
            const response = await authService.registerUser({"first_name":userData.first_name,"last_name":userData.last_name,"email":userData.email,"password":userData.password});
            if (response.token) {
                login(response.token);

                // Récupérer les informations de l'utilisateur
                const user = await authService.getUserByToken(response.token);
                if (user) {
                    setUser(user.data);
                    setIsAuthenticated(true);
                    // Add user to cache
                    queryClient.setQueryData(['user'], user.data);
                }

                return { token: response.token };
            }
            throw new Error('Registration failed');
        },

        onSuccess: async (response: AuthResponse) => {
            login(response.token);
        },
    });
};

/**
 * Hook pour la connexion d'un utilisateur
 * @returns {Object} Mutation pour la connexion
 */
export const useLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();

    return useMutation<
        { token: string },
        Error,
        { email: string; password: string; rememberMe: boolean }
    >({
        mutationFn: async ({ email, password, rememberMe }: LoginDto) => {
            const response = await authService.loginUser({ email, password, rememberMe });
            if (response.token) {
                // Mettre à jour le store avec les tokens
                login(response.token);

                // Récupérer les informations de l'utilisateur
                const user = await authService.getUserByToken(response.token);
                if (user) {
                    setUser(user.data);
                    setIsAuthenticated(true);
                    // Add user to cache
                    queryClient.setQueryData(['user'], user.data);
                }

                return { token: response.token };
            }
            throw new Error('Login failed');
        },

        onSuccess: async (response: AuthResponse) => {
            login(response.token);
        },
    });
};

/**
 * Hook pour la connexion automatique
 * @returns {Object} Query pour la connexion automatique
 */
export const useAutoLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['autoLogin'],
        queryFn: async () => {
            const accessToken = Cookies.get('accessToken');

            if (accessToken) {
                try {
                    const response = await authService.getUserByToken(accessToken);
                    login(accessToken);
                    setUser(response?.data || null);
                    setIsAuthenticated(true);
                    return true;
                } catch {
                    console.error('Failed to refresh token, user needs to log in again.');
                    handleLogout()
                }
            } else {
                handleLogout();
            }
            return false;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

/**
 * Hook pour récupérer l'utilisateur actuel
 * @returns {Object} Query pour l'utilisateur actuel
 */
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            return authService.getUserByToken(Cookies.get('accessToken') || '');
        },
    });
};

/**
 * Hook pour la déconnexion
 * @returns {Object} Mutation pour la déconnexion
 */
export const useLogout = () => {
    const refreshToken = Cookies.get('refreshToken');
    return useMutation({
        mutationFn: async () => {
            handleLogout();

            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        },
    });
};

/**
 * Hook pour mettre à jour le mot de passe
 * @returns {Object} Mutation pour la mise à jour du mot de passe
 */
export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (password: UpdatePasswordDto) => {
            return authService.updatePassword(password);
        },
    });
};

/**
 * Hook pour récupérer les sessions
 * @returns {Object} Query pour les sessions
 */
export const useGetSessions = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            return authService.getSessions(user?.id || '').then((response) => {
                return response.data;
            });
        },
    });
};

/**
 * Hook pour demander une réinitialisation de mot de passe
 * @returns {Object} Mutation pour la demande de réinitialisation
 */
export const useRequestPasswordReset = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return authService.requestPasswordReset({ email });
        },
    });
};

/**
 * Hook pour réinitialiser le mot de passe
 * @returns {Object} Mutation pour la réinitialisation du mot de passe
 */
export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordDto) => {
            return authService.resetPassword(data);
        },
    });
};

/**
 * Fonction pour gérer la déconnexion
 */
const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    useAuthStore.getState().logout();
};
