import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date?: Date): string {
    if (!date || Number.isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
}

type Primitive = string | number | boolean | null | undefined;

export class TypedQueryBuilder<T extends Record<string, unknown>> {
    private filters: Partial<T> = {};

    public setFilters(filters: Partial<T>) {
        this.filters = filters ?? {};
        return this;
    }

    public build(withQuestionMark: boolean = false): string {
        const params = new URLSearchParams();
        Object.entries(this.filters).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            // Filter out empty strings
            if (typeof value === 'string' && value.trim() === '') return;
            // Handle arrays
            if (Array.isArray(value)) {
                (value as Primitive[]).forEach((v) => {
                    if (v !== undefined && v !== null && String(v) !== '') {
                        params.append(key, String(v));
                    }
                });
                return;
            }
            params.set(key, String(value as Primitive));
        });
        const qs = params.toString();
        if (!qs) return '';
        return withQuestionMark ? `?${qs}` : qs;
    }
}
