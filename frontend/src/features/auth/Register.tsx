import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';

import { useRegister } from '@/api/queries';

import { Button, Card, Input } from '@/components/ui';

import { MetaTagType, generateSocialMetas, useMetadata } from '@/lib/metadata';

import { RegisterDto, registerSchema } from '@/schemas';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import Galaxy from '@/components/Galaxy';
import { Navbar } from '@/components/layout';

export function Register() {
    const { helmet } = useMetadata({
        title: 'Inscription',
        description: 'Créez votre compte pour commencer',
        keywords: 'inscription, créer compte',
        customMetas: [
            ...generateSocialMetas(
                'Inscription',
                'Rejoignez-nous',
                '/images/register-og.jpg'
            ),
            { key: MetaTagType.ROBOTS, value: 'noindex, nofollow' },
        ],
    });

    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterDto>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const { mutate: registerUser, isPending, error: serverError } = useRegister();

    const password = watch('password', '');
    const confirmPassword = watch('confirmPassword', '');

    const calculatePasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length > 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const strength = calculatePasswordStrength(password);

    const handleNextStep = async () => {
        const isValid = await trigger(['first_name', 'last_name', 'email']);
        if (isValid) setStep(2);
    };

    const onSubmit = async (data: RegisterDto) => {
        try {
            if (data.password !== data.confirmPassword) return;
            registerUser({
                ...data,
                acceptTerms: true,
                acceptPrivacy: true,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const stepVariants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
            },
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
            },
        }),
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
                        <Card className="glass-card shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex gap-1.5">
                                            {[1, 2].map((s) => (
                                                <div
                                                    key={s}
                                                    className={`h-1 rounded-full transition-all duration-500 ${
                                                        step === s ? 'w-8 bg-secondary' : 'w-4 bg-white/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                                            Étape {step} / 2
                                        </span>
                                    </div>

                                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                        {step === 1 ? 'Bienvenue' : 'Sécurité'}
                                    </h1>
                                    <p className="text-white/60 text-sm">
                                        {step === 1
                                            ? 'Commençons par faire connaissance.'
                                            : 'Protégez votre compte avec un mot de passe robuste.'}
                                    </p>
                                </div>

                                {serverError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                                    >
                                        <AlertCircle size={18} />
                                        <span>Une erreur est survenue lors de l'inscription.</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <AnimatePresence mode="wait" custom={step === 2 ? 1 : -1}>
                                        {step === 1 ? (
                                            <motion.div
                                                key="step1"
                                                custom={1}
                                                variants={stepVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label htmlFor="first_name" className="text-xs font-semibold text-white/70 ml-1">
                                                            Prénom
                                                        </label>
                                                        <Input
                                                            id="first_name"
                                                            label=""
                                                            {...register('first_name')}
                                                            placeholder="Jean"
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all"
                                                            aria-invalid={!!errors.first_name}
                                                        />
                                                        {errors.first_name && (
                                                            <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                                {errors.first_name.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label htmlFor="last_name" className="text-xs font-semibold text-white/70 ml-1">
                                                            Nom
                                                        </label>
                                                        <Input
                                                            id="last_name"
                                                            label=""
                                                            {...register('last_name')}
                                                            placeholder="Dupont"
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all"
                                                            aria-invalid={!!errors.last_name}
                                                        />
                                                        {errors.last_name && (
                                                            <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                                {errors.last_name.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label htmlFor="email" className="text-xs font-semibold text-white/70 ml-1">
                                                        Email
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        label=""
                                                        {...register('email')}
                                                        type="email"
                                                        placeholder="jean.dupont@example.com"
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all"
                                                        aria-invalid={!!errors.email}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                            {errors.email.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    variant="primary"
                                                    className="w-full mt-4 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 group"
                                                >
                                                    Continuer
                                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="step2"
                                                custom={1}
                                                variants={stepVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                className="space-y-4"
                                            >
                                                <div className="space-y-1.5">
                                                    <label htmlFor="password" className="text-xs font-semibold text-white/70 ml-1">
                                                        Mot de passe
                                                    </label>
                                                    <Input
                                                        id="password"
                                                        label=""
                                                        {...register('password')}
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all"
                                                        aria-invalid={!!errors.password}
                                                    />
                                                    {errors.password && (
                                                        <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                            {errors.password.message}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-1 pt-1 px-1">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                                                    i <= strength
                                                                        ? strength <= 2
                                                                            ? 'bg-orange-500'
                                                                            : 'bg-emerald-500'
                                                                        : 'bg-white/10'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-white/70 ml-1">
                                                        Confirmer le mot de passe
                                                    </label>
                                                    <Input
                                                        id="confirmPassword"
                                                        label=""
                                                        {...register('confirmPassword')}
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all"
                                                        aria-invalid={!!errors.confirmPassword}
                                                    />
                                                    {errors.confirmPassword && (
                                                        <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                                            {errors.confirmPassword.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3 pt-2">
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        disabled={
                                                            isSubmitting ||
                                                            isPending ||
                                                            password !== confirmPassword ||
                                                            password.length === 0
                                                        }
                                                        className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2"
                                                    >
                                                        {isSubmitting || isPending ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>Inscription en cours...</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                Créer mon compte
                                                                <ShieldCheck size={20} />
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setStep(1)}
                                                        variant="ghost"
                                                        className="h-10 flex items-center justify-center gap-2"
                                                    >
                                                        <ArrowLeft size={16} />
                                                        Retour
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                                <p className="text-sm text-white/40">
                                    Déjà un compte ?{' '}
                                    <Link
                                        to="/login"
                                        className="text-secondary font-semibold hover:text-secondary/80 transition-colors underline-offset-4 hover:underline"
                                    >
                                        Se connecter
                                    </Link>
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Fragment>
    );
}
