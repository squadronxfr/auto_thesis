import { z } from 'zod';

export const userUpdateSchema = z.object({
    first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
    last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    email: z.string().email('Email invalide').optional(),
    phoneNumber: z.string().optional(),
});

export const userFiltersSchema = z.object({
    search: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
});

export type UserUpdateDto = z.infer<typeof userUpdateSchema>;
export type UserUpdateSchema = UserUpdateDto;
export type UserFilters = z.infer<typeof userFiltersSchema>;

export interface UserDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phoneNumber?: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokenDto {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}
