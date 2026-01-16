import type { ApiResponse, PaginatedResponse } from '@/types';

import { api } from '@/api/interceptor';

import type { UserDto, UserUpdateSchema } from '@/schemas';

class UserService {
    private apiUrl = '/api/users';

    /**
     * Liste les utilisateurs avec pagination
     * @param queryString - Query string construite avec QueryBuilder
     * @returns Response avec data et pagination
     */
    public async list(queryString: string = ''): Promise<PaginatedResponse<UserDto>> {
        const qs = queryString ? `?${queryString}` : '';
        const response = await api.fetchRequest(`${this.apiUrl}${qs}`, 'GET', null, true);
        return response;
    }

    public async getUserById(userId: string): Promise<ApiResponse<UserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'GET', null, true);
    }

    public async updateUser(userId: string, user: UserUpdateSchema): Promise<ApiResponse<UserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'PATCH', user, true);
    }

    public async deleteUser(userId: string): Promise<ApiResponse<UserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'DELETE', null, true);
    }

    /**
     * Récupère la liste de tous les utilisateurs (admin only)
     * @returns Response avec la liste complète des utilisateurs
     */
    public async getAllUsers(): Promise<ApiResponse<UserDto[]>> {
        return api.fetchRequest('/api/auth/admin/users', 'GET', null, true);
    }
}

export const userService = new UserService();
