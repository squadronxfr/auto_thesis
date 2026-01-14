import { Fragment, useId } from 'react';
import { toast } from 'react-toastify';

import { ImageDown } from 'lucide-react';

interface FileUploadProps {
    label: string;
    accept?: string;
    maxSize?: number;
    buttonOnly?: boolean;
    onFileChange: (file: File | null) => void;
    error?: string;
    value?: File | null;
    buttonText?: string;
    buttonClassName?: string;
}

export const FileUpload = ({
    label,
    accept = 'image/*',
    maxSize = 10,
    onFileChange,
    buttonOnly = false,
    error,
    value,
    buttonText = 'Télécharger un fichier',
    buttonClassName = 'bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-white/90 cursor-pointer',
}: FileUploadProps) => {
    const fileId = useId();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            onFileChange(null);
            return;
        }

        if (!file.type.match(accept)) {
            toast.error(`Type de fichier non supporté. Veuillez uploader un fichier ${accept}`);
            return;
        }

        // Vérification de la taille du fichier (en MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
            toast.error(`Fichier trop volumineux. La taille maximale est de ${maxSize} MB.`);
            return;
        }

        onFileChange(file);
    };

    if (buttonOnly) {
        return (
            <Fragment>
                <label htmlFor={fileId} className={buttonClassName}>
                    {buttonText}
                </label>
                <input
                    id={fileId}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    data-testid="file-input"
                />
            </Fragment>
        );
    }

    return (
        <Fragment>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex w-full items-center justify-center">
                <label
                    htmlFor={fileId}
                    className="flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <ImageDown strokeWidth={1.25} className="mb-4 h-8 w-8 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour télécharger</span> ou
                            glisser-déposer
                        </p>
                        <p className="text-xs text-gray-500">
                            {accept === 'image/*' ? "Image jusqu'à" : "Fichier jusqu'à"} {maxSize}MB
                        </p>
                    </div>
                    <input
                        id={fileId}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        data-testid="file-input"
                    />
                </label>
            </div>
            {value && (
                <div className="mt-2 text-center text-sm text-gray-500">
                    Fichier sélectionné: {value.name}
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </Fragment>
    );
};
