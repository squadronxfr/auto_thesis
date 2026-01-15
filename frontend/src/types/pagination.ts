export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
