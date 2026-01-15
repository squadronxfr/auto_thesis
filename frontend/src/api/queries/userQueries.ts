import type { PaginatedResponse } from '@/types';

import { userService } from '@/api';

import type { UserDto, UserUpdateSchema } from '@/schemas';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer la liste des utilisateurs
 * @param queryString - Query string construite avec QueryBuilder (sans le '?')
 */
export const useUserList = (queryString: string = '') => {
    return useQuery<PaginatedResponse<UserDto>>({
        queryKey: ['users', queryString],
        queryFn: () => userService.list(queryString),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook pour récupérer la liste des utilisateurs avec infinite scroll
 * @param queryString - Query string construite avec QueryBuilder (sans le '?')
 */
export const useUserListInfinite = (queryString: string = '') => {
    return useInfiniteQuery<PaginatedResponse<UserDto>>({
        queryKey: ['users', 'infinite', queryString],
        queryFn: ({ pageParam }) => {
            const params = new URLSearchParams(queryString);
            params.set('page', String(pageParam));
            return userService.list(params.toString());
        },
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        placeholderData: (previousData) => previousData,
    });
};

export const useGetUserById = (userId: string) => {
    return useQuery<UserDto>({
        queryKey: ['users', userId],
        queryFn: async () => {
            const response = await userService.getUserById(userId);
            return response.data;
        },
    });
};

export const useUpdateUser = () => {
    return useMutation<UserDto, Error, { userId: string; user: UserUpdateSchema }>({
        mutationFn: async ({ userId, user }: { userId: string; user: UserUpdateSchema }) => {
            const response = await userService.updateUser(userId, user);
            return response.data;
        },
    });
};

export const useDeleteUser = () => {
    return useMutation<UserDto, Error, string>({
        mutationFn: async (id: string) => {
            const response = await userService.deleteUser(id);
            return response.data;
        },
    });
};
