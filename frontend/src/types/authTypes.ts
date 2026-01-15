import type { UserDto } from '@/schemas';

// Données d'inscription
export interface RegisterCredentials {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

// Données de connexion
export interface LoginCredentials {
    email: string;
    password: string;
}

// Réponse de l'API après authentification
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

// Réponse complète incluant l'utilisateur
export interface AuthResponseWithUser extends AuthResponse {
    user: UserDto;
}

// Type pour le refresh token
export interface RefreshTokenRequest {
    token: string;
}
