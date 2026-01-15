import { useQueryBuilder } from '@/hooks';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Eye, Filter, Loader2, User } from 'lucide-react';

import { useUserListInfinite } from '@/api/queries';

import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';

import type { UserFilters } from '@/schemas';

export function Users() {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { filters, queryString, updateFilters } = useQueryBuilder<UserFilters>({
        page: '1',
        limit: '10',
    });

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useUserListInfinite(queryString);

    const users = data?.pages.flatMap((page) => page.data) ?? [];
    const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading || isFetchingNextPage) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0]?.isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    const handleSearch = useCallback(
        (query: string) => {
            setSearchValue(query);

            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
                if (query) {
                    updateFilters({
                        search: query,
                    });
                } else {
                    updateFilters({
                        firstName: undefined,
                        search: undefined,
                    });
                }
            }, 300);
        },
        [updateFilters]
    );

    const activeFiltersCount = Object.entries(filters).filter(
        ([key, value]) =>
            !['search', 'page', 'limit'].includes(key) &&
            value !== undefined &&
            value !== '' &&
            value !== null
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Utilisateurs</h1>
            </div>

            {/* Filters */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <input
                            type="search"
                            placeholder="Rechercher par nom, email, téléphone..."
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                        />
                    </div>
                    <Button
                        variant={showAdvancedFilters ? 'primary' : 'secondary'}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="gap-2"
                    >
                        <Filter size={16} />
                        Filtres avancés
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Prénom
                            </label>
                            <input
                                type="text"
                                placeholder="Prénom..."
                                value={filters.firstName || ''}
                                onChange={(e) =>
                                    updateFilters({ firstName: e.target.value || undefined })
                                }
                                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Nom
                            </label>
                            <input
                                type="text"
                                placeholder="Nom..."
                                value={filters.lastName || ''}
                                onChange={(e) =>
                                    updateFilters({ lastName: e.target.value || undefined })
                                }
                                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Email..."
                                value={filters.email || ''}
                                onChange={(e) =>
                                    updateFilters({ email: e.target.value || undefined })
                                }
                                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                placeholder="Numéro de téléphone..."
                                value={filters.phoneNumber || ''}
                                onChange={(e) =>
                                    updateFilters({ phoneNumber: e.target.value || undefined })
                                }
                                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                    <h2 className="text-base font-semibold text-gray-900">
                        Liste des utilisateurs
                    </h2>
                    <p className="mt-1 text-xs text-gray-600">
                        {totalItems} utilisateur{totalItems > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            Aucun utilisateur trouvé
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="text-[.65rem]">Nom complet</p>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="text-[.65rem]">Email</p>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="text-[.65rem]">Rôles</p>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="text-[.65rem]">Date de création</p>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="text-[.65rem]">Dernière mise à jour</p>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-left font-medium uppercase tracking-wider text-gray-500">
                                        <p className="sr-only text-[.65rem]">Actions</p>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const nameParts = `${user.firstName} ${user.lastName}`
                                        .trim()
                                        .split(/\s+/);
                                    const firstInitial = nameParts[0]?.[0]?.toUpperCase() || '?';
                                    const secondInitial =
                                        nameParts[1]?.[0]?.toUpperCase() ||
                                        nameParts[0]?.[1]?.toUpperCase() ||
                                        '?';
                                    const initials = `${firstInitial}${secondInitial}`;
                                    const fullName = `${user.firstName} ${user.lastName}`;
                                    const createdAt = new Date(user.createdAt).toLocaleDateString(
                                        'fr-FR'
                                    );
                                    const updatedAt = new Date(user.updatedAt).toLocaleDateString(
                                        'fr-FR'
                                    );

                                    return (
                                        <TableRow
                                            key={user.id}
                                            className="border-b border-gray-100 hover:!bg-gray-50"
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[.6rem] font-medium text-white">
                                                        {initials}
                                                    </div>
                                                    <Link
                                                        to={`/users/${user.id}`}
                                                        className="text-left text-xs font-medium text-primary hover:underline"
                                                        title={fullName}
                                                    >
                                                        {fullName}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="text-xs text-gray-900">
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-xs text-gray-900">
                                                {createdAt}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-xs text-gray-600">
                                                {updatedAt}
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <button
                                                    onClick={() =>
                                                        window.open(`/users/${user.id}`, '_blank')
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-600 p-1 hover:bg-gray-50"
                                                    title="Voir le profil"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {/* Infinite scroll trigger */}
                                <tr ref={loadMoreRef}>
                                    <td colSpan={6} className="py-4 text-center">
                                        {isFetchingNextPage && (
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                        )}
                                    </td>
                                </tr>
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
