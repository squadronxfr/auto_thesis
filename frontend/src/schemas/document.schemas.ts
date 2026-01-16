import { z } from 'zod';

export const documentUploadSchema = z.object({
    topic: z.string()
        .min(15, 'Le sujet doit contenir au moins 15 caractères')
        .max(255, 'Le sujet ne doit pas dépasser 255 caractères'),
    file: z.instanceof(File)
        .refine(
            (file) => file.type === 'application/pdf',
            'Seuls les fichiers PDF sont acceptés'
        )
        .refine(
            (file) => file.size <= 50 * 1024 * 1024, // 50MB
            'Le fichier ne doit pas dépasser 50MB'
        ),
});

export type DocumentUploadDto = z.infer<typeof documentUploadSchema>;
