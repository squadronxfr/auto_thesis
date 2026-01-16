import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';

import { Button, Card, Input } from '@/components/ui';

import { MetaTagType, generateSocialMetas, useMetadata } from '@/lib';

import { RequestPasswordResetDto, requestPasswordResetSchema } from '@/schemas';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Galaxy from '@/components/Galaxy';
import { Navbar } from '@/components/layout';

export function ForgotPassword() {
    const { helmet } = useMetadata({
        title: 'Mot de passe oublié',
        description: 'Réinitialisez votre mot de passe',
        keywords: 'mot de passe oublié, réinitialisation',
        customMetas: [
            ...generateSocialMetas(
                'Mot de passe oublié',
                'Réinitialisez votre mot de passe',
                '/images/forgot-password-og.jpg'
            ),
            { key: MetaTagType.ROBOTS, value: 'noindex, nofollow' },
        ],
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RequestPasswordResetDto>({
        resolver: zodResolver(requestPasswordResetSchema),
    });

    const onSubmit = async (_data: RequestPasswordResetDto) => {
        setIsLoading(true);
        setServerError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSubmitted(true);
        } catch (error) {
            setServerError('Une erreur réseau est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setServerError(null);
        reset();
    };

    return (
        <Fragment>
            {helmet}
            <Navbar />
            <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden overscroll-none bg-[#0A0F1C]">
                <div className="absolute inset-0 z-0">
                    <Galaxy 
                        density={1.5} 
                        mouseRepulsion={true} 
                        mouseInteraction={true} 
                        glowIntensity={0.5} 
                        saturation={0.8} 
                        hueShift={240} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0F1C]" />
                </div>

                <div className="relative z-10 w-full max-w-md px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Card className="glass-card shadow-2xl transition-all duration-300">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <div className="mx-auto w-12 h-1 bg-secondary rounded-full mb-4" />
                                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                        Mot de passe oublié
                                    </h1>
                                    <p className="text-white/60 text-sm">
                                        Entrez votre adresse email pour réinitialiser votre accès.
                                    </p>
                                </div>

                                {!isSubmitted ? (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                                                Email
                                            </label>
                                            <Input
                                                id="email"
                                                label=""
                                                {...register('email')}
                                                type="email"
                                                placeholder="nom@exemple.com"
                                                disabled={isLoading}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all duration-200"
                                                aria-invalid={!!errors.email}
                                            />
                                            {errors.email && (
                                                <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        {serverError && (
                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle size={16} />
                                                    <span>{serverError}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRetry}
                                                    className="text-left underline font-bold hover:text-red-300 transition-colors"
                                                >
                                                    Réessayer
                                                </button>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={isLoading}
                                            className="w-full h-12 font-semibold group"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Traitement...</span>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Envoyer le lien
                                                    <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="py-4 text-center space-y-4"
                                    >
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-500/30">
                                            <CheckCircle className="w-8 h-8 text-green-400" />
                                        </div>
                                        <p className="text-white/90 leading-relaxed font-medium">
                                            Si un compte existe, un email a été envoyé.
                                        </p>
                                        <p className="text-white/50 text-xs">
                                            Vérifiez vos courriers indésirables si vous ne recevez rien d'ici quelques
                                            minutes.
                                        </p>
                                    </motion.div>
                                )}

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-white/50 hover:text-secondary transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={16} />
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Fragment>
    );
}
