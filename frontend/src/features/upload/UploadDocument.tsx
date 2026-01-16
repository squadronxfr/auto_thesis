import { motion } from 'framer-motion';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card } from '@/components/ui';
import { Sidebar, Footer } from '@/components/layout';
import { MetaTagType, generateSocialMetas, useMetadata } from '@/lib';
import { DocumentUploadForm } from './components';

export function UploadDocument() {
    const navigate = useNavigate();

    const { helmet } = useMetadata({
        title: 'Upload Document - Auto Thesis',
        description: 'Uploadez votre document PDF pour le traitement',
        keywords: 'upload, document, pdf, mémoire',
        customMetas: [
            ...generateSocialMetas(
                'Upload Document',
                'Uploadez et traitez vos documents',
                '/images/upload-og.jpg'
            ),
            { key: MetaTagType.ROBOTS, value: 'noindex, nofollow' },
        ],
    });

    return (
        <>
            {helmet}
            <div className="min-h-screen bg-[#0A0F1C] flex">
                <Sidebar />

                <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    {/* Bouton retour */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                            Retour au Dashboard
                        </Button>
                    </motion.div>

                    {/* En-tête */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center">
                                <Upload className="text-[#126FFF]" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    Nouvel <span className="text-[#126FFF]">Upload</span>
                                </h1>
                                <p className="text-slate-400 mt-1">
                                    Uploadez votre document PDF pour le traitement
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Formulaire */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <Card
                                className="glass-card"
                                padding="p-6 md:p-8"
                                maxWidth="max-w-none"
                            >
                                <DocumentUploadForm />
                            </Card>
                        </motion.div>

                        {/* Panneau d'information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Étapes du processus */}
                            <Card
                                className="glass-card"
                                padding="p-6"
                                maxWidth="max-w-none"
                            >
                                <h3 className="text-white font-semibold mb-4">Étapes du processus</h3>
                                <ol className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#126FFF]/20 text-[#126FFF] flex items-center justify-center text-sm font-bold">
                                            1
                                        </span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Remplissez le sujet</p>
                                            <p className="text-slate-400 text-xs">Décrivez votre sujet</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#126FFF]/20 text-[#126FFF] flex items-center justify-center text-sm font-bold">
                                            2
                                        </span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Uploadez votre PDF</p>
                                            <p className="text-slate-400 text-xs">Max 50MB, format PDF uniquement</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#126FFF]/20 text-[#126FFF] flex items-center justify-center text-sm font-bold">
                                            3
                                        </span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Cliquez "Lancer"</p>
                                            <p className="text-slate-400 text-xs">Le bouton s'active si tout est OK</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#126FFF]/20 text-[#126FFF] flex items-center justify-center text-sm font-bold">
                                            4
                                        </span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Suivi du traitement</p>
                                            <p className="text-slate-400 text-xs">Voir l'avancement sur votre dashboard</p>
                                        </div>
                                    </li>
                                </ol>
                            </Card>

                            {/* Conditions de validité */}
                            <Card
                                className="glass-card border-blue-500/20"
                                padding="p-4"
                                maxWidth="max-w-none"
                            >
                                <h4 className="text-blue-400 font-semibold mb-3 text-sm">
                                    ✓ Conditions pour activer "Lancer"
                                </h4>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        Sujet rempli (min 15 caractères)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        Fichier PDF uploadé
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        Fichier valide (non corrompu)
                                    </li>
                                </ul>
                            </Card>

                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}
