import type { ApiResponse, AuthResponse, RefreshTokenRequest } from '@/types';

import { api } from '@/api/interceptor';

import type {
    AuthTokenDto,
    LoginSchema,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
    UpdatePasswordDto,
    UserDto,
} from '@/schemas';

import Cookies from 'js-cookie';

class AuthService {
    public async registerUser(user: RegisterDto): Promise<AuthResponse> {
        const response = await api.fetchRequest('/auth/register', 'POST', user);
        if (response.token) {
            Cookies.set('accessToken', response.accessToken, { expires: 1 });
            Cookies.set('refreshToken', response.refreshToken, { expires: 30 });
        }
        return response;
    }

    public async loginUser(credentials: LoginSchema): Promise<AuthResponse> {
        const response = await api.fetchRequest('/auth/login', 'POST', credentials);
        if (response.token) {
            Cookies.set('accessToken', response.token, { expires: 1 });
        }
        return response;
    }

    public async getUserByToken(accessToken: string): Promise<ApiResponse<UserDto> | null> {
        if (!accessToken) {
            return null;
        }
        return api.fetchRequest('/api/auth/me', 'GET', null, true);
    }

    public async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/refresh_token', 'POST', {
            token: refreshToken,
        });
        if (response.accessToken) {
            Cookies.set('accessToken', response.accessToken, { expires: 1 });
            Cookies.set('refreshToken', response.refreshToken, { expires: 7 });
        }
        return response;
    }

    public async logout(refreshToken: string): Promise<ApiResponse<void>> {
        const request: RefreshTokenRequest = { token: refreshToken };
        return api.fetchRequest('/logout', 'POST', request);
    }

    public async updatePassword(password: UpdatePasswordDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/update-password', 'POST', password, true);
    }

    public async getSessions(userId: string): Promise<ApiResponse<AuthTokenDto[]>> {
        return api.fetchRequest(`/api/auth/sessions?userId=${userId}`, 'GET', null, true);
    }

    public async requestPasswordReset(data: RequestPasswordResetDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/forgot-password', 'POST', data);
    }

    public async resetPassword(data: ResetPasswordDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/reset-password', 'POST', data);
    }
}

export const authService = new AuthService();
