import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Upload, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, Input } from '@/components/ui';
import { FileUpload } from '@/components/ui/FileUpload';
import { documentService } from '@/api/documentService';
import { useAuthStore } from '@/stores/authStore';
import { documentUploadSchema, type DocumentUploadDto } from '@/schemas/document.schemas';

interface DocumentUploadFormProps {
    onSuccess?: () => void;
}

export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        topic: '',
        file: null as File | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Vérifier si le formulaire est valide
    const isFormValid = formData.topic.trim().length >= 15 && formData.file !== null;

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, topic: value }));
        
        // Effacer l'erreur du sujet si l'utilisateur commence à saisir
        if (errors.topic) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.topic;
                return newErrors;
            });
        }
    };

    const handleFileChange = (file: File | null) => {
        setFormData(prev => ({ ...prev, file }));
        
        // Effacer l'erreur du fichier si un fichier est sélectionné
        if (errors.file && file) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.file;
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Réinitialiser les erreurs
        setErrors({});

        // Valider le formulaire
        try {
            const validatedData = documentUploadSchema.parse({
                topic: formData.topic.trim(),
                file: formData.file,
            }) as DocumentUploadDto;

            setIsLoading(true);
            setUploadProgress(0);

            // Construire FormData
            const uploadData = new FormData();
            uploadData.append('file', validatedData.file);
            uploadData.append('topic', validatedData.topic);
            if (user?.id) {
                uploadData.append('user_id', user.id);
            }

            // Simuler la progression de l'upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 30;
                });
            }, 200);

            try {
                // Appel API
                const response = await documentService.generateDocument(uploadData);
                clearInterval(progressInterval);
                setUploadProgress(100);
                if (response && response.data) {
                    toast.success('Traitement lancé avec succès! Redirection vers le dashboard...');
                    
                    // Réinitialiser le formulaire
                    setFormData({ topic: '', file: null });
                    setUploadProgress(0);
                    
                    // Appeler le callback de succès si fourni
                    if (onSuccess) {
                        onSuccess();
                    }
                    // Redirection vers le dashboard avec un délai
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1500);
                }
            } catch (error) {
                clearInterval(progressInterval);
                throw error;
            }
        } catch (error: any) {
            setIsLoading(false);
            setUploadProgress(0);

            // Gérer les erreurs de validation Zod
            if (error.errors && Array.isArray(error.errors)) {
                const validationErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    if (err.path && err.path.length > 0) {
                        const fieldName = err.path[0] as string;
                        validationErrors[fieldName] = err.message;
                    }
                });
                setErrors(validationErrors);
            } 
            // Gérer les erreurs API
            else if (error.message) {
                toast.error(`Erreur: ${error.message}`);
            } 
            // Erreur inconnue
            else {
                toast.error('Une erreur est survenue lors de l\'upload du document');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Sujet */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <label className="block text-sm font-medium text-white mb-2">
                    Sujet <span className="text-red-500">*</span>
                </label>
                <Input
                    type="text"
                    placeholder="Ex: Impact de l'IA sur la transformation numérique des entreprises"
                    value={formData.topic}
                    onChange={handleTopicChange}
                    disabled={isLoading}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-[#126FFF]/30 focus:border-[#126FFF]/50 transition-all ${
                        errors.topic ? 'border-red-500/50 focus:border-red-500' : ''
                    }`}
                    name="topic"
                    label=""
                />
                {errors.topic && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400 flex items-center gap-1"
                    >
                        <AlertCircle size={14} />
                        {errors.topic}
                    </motion.p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                    {formData.topic.length}/255 caractères
                </p>
            </motion.div>

            {/* Upload de fichier */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <label className="block text-sm font-medium text-white mb-2">
                    Document PDF <span className="text-red-500">*</span>
                </label>
                <Card 
                    className={`glass-card transition-all ${
                        errors.file ? 'border-red-500/50' : ''
                    }`}
                    padding="p-6"
                    maxWidth="max-w-none"
                >
                    <FileUpload
                        label=""
                        accept="application/pdf"
                        maxSize={50}
                        onFileChange={handleFileChange}
                        value={formData.file}
                        buttonText="Sélectionner un fichier PDF"
                        error={errors.file}
                    />
                </Card>
                {formData.file && !errors.file && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2"
                    >
                        <CheckCircle size={16} className="text-emerald-400" />
                        <div>
                            <p className="text-sm text-emerald-400">
                                <span className="font-semibold">{formData.file.name}</span>
                            </p>
                            <p className="text-xs text-emerald-400/70 mt-1">
                                Taille: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Information sur les formats acceptés */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
                <p className="text-sm text-blue-400">
                    <span className="font-semibold">📋 Sujet requis:</span> Minimum 15 caractères pour décrire votre mémoire
                </p>
            </motion.div>

            {/* Information sur le traitement */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
            >
                <p className="text-sm text-emerald-400">
                    <span className="font-semibold">✓ Processus:</span> Le PDF ne sera pas stocké, il servira juste à générer votre mémoire.
                </p>
            </motion.div>

            {/* Avertissement sur la validation du fichier */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
                <p className="text-sm text-amber-400">
                    <span className="font-semibold">⚠️ Attention:</span> Assurez-vous que le fichier PDF n'est pas corrompu. Le traitement échouera avec un message d'erreur si le fichier est invalide.
                </p>
            </motion.div>

            {/* Barre de progression */}
            {isLoading && uploadProgress > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">⏳ Génération de votre mémoire en cours...</span>
                        <span className="text-sm text-slate-400">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#126FFF] to-blue-400"
                            initial={{ width: '0%' }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Boutons d'action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex gap-3 justify-end pt-4 border-t border-white/10"
            >
                <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                >
                    Retour
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`flex items-center gap-2 transition-all ${
                        !isFormValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? (
                        <>
                            <Loader size={18} className="animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Lancer
                        </>
                    )}
                </Button>
            </motion.div>
        </form>
    );
}
