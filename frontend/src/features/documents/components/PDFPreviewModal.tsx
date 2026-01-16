import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
    onDownload: () => void;
}

export function PDFPreviewModal({ 
    isOpen, 
    onClose, 
    documentId, 
    documentName,
    onDownload 
}: PDFPreviewModalProps) {
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-4 md:inset-8 bg-[#0F172A] border border-white/10 rounded-xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white truncate">
                                    {documentName}
                                </h2>
                                <p className="text-sm text-slate-400">Prévisualisation PDF</p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <Button
                                        variant="ghost"
                                        onClick={handleZoomOut}
                                        className="p-1 h-auto"
                                    >
                                        <ZoomOut size={16} />
                                    </Button>
                                    <span className="text-sm text-white min-w-[3rem] text-center">
                                        {zoom}%
                                    </span>
                                    <Button
                                        variant="ghost"
                                        onClick={handleZoomIn}
                                        className="p-1 h-auto"
                                    >
                                        <ZoomIn size={16} />
                                    </Button>
                                </div>

                                {/* Download Button */}
                                <Button
                                    variant="secondary"
                                    onClick={onDownload}
                                    className="flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Télécharger
                                </Button>

                                {/* Close Button */}
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="p-2"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-auto bg-slate-900 p-4">
                            <div 
                                className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl"
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                            >
                                {/* Placeholder pour le PDF */}
                                <div className="aspect-[8.5/11] flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <p className="text-lg mb-2">Prévisualisation PDF</p>
                                        <p className="text-sm">Document ID: {documentId}</p>
                                        <p className="text-xs mt-4 text-slate-500">
                                            Intégration avec react-pdf ou pdf.js à venir
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
