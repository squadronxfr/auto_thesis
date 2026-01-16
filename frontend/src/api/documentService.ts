import type { ApiResponse, PaginatedResponse } from '@/types';

import { api } from '@/api/interceptor';

export interface DocumentDto {
    id: string;
    name: string;
    created_at: string;
}

class DocumentService {
    private apiUrl = '/api/documents';

    /**
     * Liste les documents avec pagination
     * @param queryString - Query string construite avec QueryBuilder
     * @returns Response avec data et pagination
     */
    public async list(queryString: string = ''): Promise<PaginatedResponse<DocumentDto>> {
        const qs = queryString ? `?${queryString}` : '';
        const response = await api.fetchRequest(`${this.apiUrl}${qs}`, 'GET', null, true);
        return response;
    }

    public async getDocumentById(documentId: string): Promise<ApiResponse<DocumentDto>> {
        return api.fetchRequest(`${this.apiUrl}/${documentId}`, 'GET', null, true);
    }

    public async downloadDocument(documentId: string): Promise<Blob> {
        const response = await fetch(`${this.apiUrl}/${documentId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to download document');
        }
        
        return response.blob();
    }

    public async deleteDocument(documentId: string): Promise<ApiResponse<DocumentDto>> {
        return api.fetchRequest(`${this.apiUrl}/${documentId}`, 'DELETE', null, true);
    }

    /**
     * Upload un document (PDF) et lance le traitement de génération du mémoire
     * @param formData - FormData contenant file, topic, et user_id
     * @returns Response avec les données du traitement initié
     */
    public async generateDocument(formData: FormData): Promise<ApiResponse<DocumentDto>> {
        return api.fetchRequest(`${this.apiUrl}/generate`, 'POST', formData, true);
    }
}

export const documentService = new DocumentService();
