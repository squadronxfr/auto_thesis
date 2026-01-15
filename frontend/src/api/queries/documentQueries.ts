import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentService, DocumentDto } from '@/api/documentService';
import { PaginatedResponse } from '@/types';

/**
 * Hook pour récupérer la liste des documents
 */
export const useDocuments = (queryString: string = '') => {
    return useQuery<PaginatedResponse<DocumentDto>>({
        queryKey: ['documents', queryString],
        queryFn: () => documentService.list(queryString),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook pour récupérer un document par son ID
 */
export const useDocument = (documentId: string) => {
    return useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentService.getDocumentById(documentId),
        enabled: !!documentId,
    });
};

/**
 * Hook pour télécharger un document
 */
export const useDownloadDocument = () => {
    return useMutation({
        mutationFn: async (documentId: string) => {
            const blob = await documentService.downloadDocument(documentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document-${documentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    });
};

/**
 * Hook pour supprimer un document
 */
export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId: string) => documentService.deleteDocument(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};
