import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';

import { useLogin } from '@/api/queries';

import { Button, Card, Input } from '@/components/ui';

import { MetaTagType, generateSocialMetas, useMetadata } from '@/lib';

import { LoginDto, loginSchema } from '@/schemas';

import { zodResolver } from '@hookform/resolvers/zod';
import Galaxy from '@/components/Galaxy';
import { Navbar } from '@/components/layout';

export function Login() {
    const { helmet } = useMetadata({
        title: 'Connexion',
        description:
            'Connectez-vous à votre compte pour accéder à votre tableau de bord',
        keywords: 'connexion, login, compte',
        customMetas: [
            ...generateSocialMetas(
                'Connexion',
                'Accédez à votre espace personnel',
                '/images/login-og.jpg'
            ),
            { key: MetaTagType.ROBOTS, value: 'noindex, nofollow' },
        ],
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginDto>({
        resolver: zodResolver(loginSchema),
    });

    const { mutate: loginUser, isPending, error: serverError } = useLogin();

    const onSubmit = async (data: LoginDto) => {
        try {
            loginUser({
                ...data,
                rememberMe: data.rememberMe || false,
            });
        } catch (error) {
            console.error(error);
        }
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

                <Card className="relative z-10 w-full max-w-md mx-4 overflow-hidden glass-card shadow-2xl transition-all duration-500">
                    <div className="p-8 sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                Ravi de vous <span className="text-secondary">revoir</span>
                            </h1>
                            <p className="text-white/60 text-sm">
                                Connectez-vous pour accéder à votre espace
                            </p>
                        </div>

                        {serverError && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in">
                                Identifiants invalides
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all duration-200"
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label htmlFor="password" className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        Mot de passe
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors duration-200"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    label=""
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-secondary/30 focus:border-secondary/50 transition-all duration-200"
                                    aria-invalid={!!errors.password}
                                />
                                {errors.password && (
                                    <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || isPending}
                                variant="primary"
                                className="w-full h-12 mt-4"
                            >
                                {isSubmitting || isPending ? (
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-white/50 text-sm">
                                Pas encore de compte ?{' '}
                                <Link
                                    to="/register"
                                    className="font-semibold text-white hover:text-secondary transition-colors duration-200"
                                >
                                    Créer un compte
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </Fragment>
    );
}
