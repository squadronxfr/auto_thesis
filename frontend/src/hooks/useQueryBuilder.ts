import { useCallback, useMemo, useState } from 'react';

import { TypedQueryBuilder } from '@/lib/utils';

/**
 * Hook générique pour gérer les filtres typés avec un FilterDto
 * et générer automatiquement la query string
 *
 * @template TFilterDto - Type du FilterDto (ex: LotFilterDto, TenantFilterDto)
 * @param initialFilters - Filtres initiaux
 * @returns Objet contenant les filtres, la query string et les fonctions de manipulation
 *
 * @example
 * ```typescript
 * const { filters, queryString, updateFilters, removeFilter } = useQueryBuilder<LotFilterDto>({
 *   page: '1',
 *   limit: '20',
 * });
 *
 * // Mettre à jour un filtre
 * updateFilters({
 *   status: FilterHelpers.equals('SIGNED_LEASE'),
 * });
 *
 * // La queryString est automatiquement recalculée
 * const { data } = useLotList(queryString);
 * ```
 */
export function useQueryBuilder<TFilterDto extends Record<string, unknown>>(
    initialFilters: Partial<TFilterDto> = {}
) {
    const [filters, setFilters] = useState<Partial<TFilterDto>>(initialFilters);

    // Construire la query automatiquement quand les filtres changent
    const queryString = useMemo(() => {
        const builder = new TypedQueryBuilder<TFilterDto>();
        return builder.setFilters(filters).build(false);
    }, [filters]);

    /**
     * Met à jour les filtres (merge avec les filtres existants)
     */
    const updateFilters = useCallback((newFilters: Partial<TFilterDto>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    /**
     * Remplace complètement les filtres
     */
    const setAllFilters = useCallback((newFilters: Partial<TFilterDto>) => {
        setFilters(newFilters);
    }, []);

    /**
     * Supprime un filtre spécifique
     */
    const removeFilter = useCallback(<K extends keyof TFilterDto>(key: K) => {
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    }, []);

    /**
     * Réinitialise tous les filtres
     */
    const resetFilters = useCallback(() => {
        setFilters({});
    }, []);

    /**
     * Réinitialise aux filtres initiaux
     */
    const resetToInitial = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    return {
        /** Objet de filtres actuel */
        filters,
        /** Query string générée automatiquement (sans le '?') */
        queryString,
        /** Met à jour les filtres (merge) */
        updateFilters,
        /** Remplace tous les filtres */
        setAllFilters,
        /** Supprime un filtre spécifique */
        removeFilter,
        /** Réinitialise tous les filtres à {} */
        resetFilters,
        /** Réinitialise aux filtres initiaux */
        resetToInitial,
    };
}
