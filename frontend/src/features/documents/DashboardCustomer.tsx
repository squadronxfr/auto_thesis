import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FileText, 
    Calendar, 
    Eye, 
    Search,
    Download,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { Sidebar, Footer } from '@/components/layout';
import { MetaTagType, generateSocialMetas, useMetadata } from '@/lib';
import { PDFPreviewModal } from './components/PDFPreviewModal';

// Type pour les documents
interface Document {
    id: string;
    name: string;
    created_at: string;
}

// Données mockées
const mockDocuments: Document[] = [
    {
        id: '1',
        name: 'Mémoire Intelligence Artificielle et Apprentissage Automatique',
        created_at: '2024-01-15T10:30:00Z'
    },
    {
        id: '2',
        name: 'Mémoire Développement Web Full Stack',
        created_at: '2024-01-10T14:20:00Z'
    },
    {
        id: '3',
        name: 'Analyse des Systèmes Distribués et Microservices',
        created_at: '2024-01-05T09:15:00Z'
    },
    {
        id: '4',
        name: 'Étude sur la Blockchain et les Cryptomonnaies',
        created_at: '2023-12-20T16:45:00Z'
    },
    {
        id: '5',
        name: 'Mémoire Application Mobile React Native',
        created_at: '2023-12-15T11:00:00Z'
    },
];

export function DashboardCustomer() {
    const { helmet } = useMetadata({
        title: 'Dashboard Client - Mes Documents',
        description: 'Gérez vos documents et mémoires',
        keywords: 'dashboard, documents, mémoires',
        customMetas: [
            ...generateSocialMetas(
                'Dashboard',
                'Accédez à vos documents',
                '/images/dashboard-og.jpg'
            ),
            { key: MetaTagType.ROBOTS, value: 'noindex, nofollow' },
        ],
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [previewDocument, setPreviewDocument] = useState<{ id: string; name: string } | null>(null);
    
    // Utiliser les données mockées
    const documents = mockDocuments;

    // Filtrer les documents selon la recherche
    const filteredDocuments = documents.filter((doc: Document) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handlePreview = (documentId: string, documentName: string) => {
        setPreviewDocument({ id: documentId, name: documentName });
    };

    const handleDownload = (documentId: string) => {
        // Simuler le téléchargement - À remplacer par l'appel API réel
        const doc = documents.find(d => d.id === documentId);
        if (doc) {
            // Créer un lien de téléchargement simulé
            const element = document.createElement('a');
            const content = encodeURIComponent(`Document: ${doc.name}`);
            element.setAttribute('href', `data:text/plain;charset=utf-8,${content}`);
            element.setAttribute('download', `${doc.name}.pdf`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    };

    return (
        <>
            {helmet}
            <div className="min-h-screen bg-[#0A0F1C] flex">
                <Sidebar />
                
                <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                                Mes <span className="text-[#126FFF]">Documents</span>
                            </h1>
                            <p className="text-sm md:text-base text-slate-400 mb-6">
                                Gérez et consultez tous vos documents générés
                            </p>

                            {/* Cards statistiques */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <Card className="glass-card" padding="p-4 md:p-6" maxWidth="max-w-none">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="text-[#126FFF]" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white">{documents.length}</p>
                                            <p className="text-xs md:text-sm text-slate-400">Documents totaux</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="glass-card" padding="p-4 md:p-6" maxWidth="max-w-none">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white">0</p>
                                            <p className="text-xs md:text-sm text-slate-400">Tokens totaux</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Barre de recherche */}
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    label=""
                                    type="text"
                                    placeholder="Rechercher un document..."
                                    name=''
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-[#126FFF]/30 focus:border-[#126FFF]/50"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Liste des documents */}
                    <div className="grid gap-4">
                        {filteredDocuments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <FileText className="mx-auto text-slate-600 mb-4" size={64} />
                                <p className="text-slate-400 text-lg">
                                    {searchQuery ? 'Aucun document trouvé' : 'Aucun document pour le moment'}
                                </p>
                            </motion.div>
                        ) : (
                            filteredDocuments.map((doc: Document, index: number) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card
                                        className="glass-card-hover cursor-pointer"
                                        padding="p-4 md:p-6"
                                        maxWidth="max-w-none"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Informations du document */}
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="text-[#126FFF]" size={20} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base md:text-lg font-semibold text-white mb-1 truncate">
                                                        {doc.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400">
                                                        <Calendar size={14} />
                                                        <span className="truncate">{formatDate(doc.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    variant="secondary"
                                                    className="flex items-center gap-2 text-sm md:text-base"
                                                    onClick={() => handlePreview(doc.id, doc.name)}
                                                >
                                                    <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                                                    <span className="hidden sm:inline">Prévisualiser</span>
                                                    <span className="sm:hidden">Voir</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDownload(doc.id)}
                                                    className="p-2"
                                                    aria-label="Télécharger"
                                                >
                                                    <Download size={16} className="md:w-[18px] md:h-[18px]" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>

                </div>
            </div>

            {/* Modal de prévisualisation PDF */}
            <PDFPreviewModal
                isOpen={previewDocument !== null}
                onClose={() => setPreviewDocument(null)}
                documentId={previewDocument?.id || ''}
                documentName={previewDocument?.name || ''}
                onDownload={() => {
                    if (previewDocument) {
                        handleDownload(previewDocument.id);
                    }
                }}
            />

            {/* Footer */}
            <Footer />
        </>
    );
}
