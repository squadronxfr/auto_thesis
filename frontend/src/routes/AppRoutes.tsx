import { PrivateRoutes, PublicRoutes } from '@/routes';

import { Fragment, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAutoLogin } from '@/api/queries';

import { Sidebar } from '@/components/layout';
import { Loader } from '@/components/ui';

import Error from '@/features/Error';
import { Login, Register, ForgotPassword } from '@/features/auth';
import { LandingPage } from '@/features/landing';
import { Profile } from '@/features/user';
import { Users } from '@/features/users';
import { DashboardCustomer } from '@/features/documents';
import { UploadDocument } from '@/features/upload';

import { useMetadata } from '@/lib/metadata';

import { useAuthStore } from '@/stores/authStore';
import { AdminDashboard } from '@/features/admin';

export function AppRoutes() {
    const { isAuthenticated } = useAuthStore();

    const { helmet } = useMetadata({
        title: 'Auto Thesis - Génération de mémoires par IA agentique',
        description:
            'Auto Thesis orchestre des agents IA spécialisés pour transformer vos idées en un manuscrit académique rigoureux. Conçu pour les étudiants et chercheurs exigeants.',
        keywords: 'mémoire, thèse, IA, intelligence artificielle, agents, académique, recherche, étudiants',
    });

    const { refetch: autoLogin, isPending } = useAutoLogin();

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    if (isPending) {
        return <Loader />;
    }

    return (
        <Fragment>
            {helmet}
            <div className="flex min-h-screen flex-row gap-4">
                {isAuthenticated && <Sidebar />}
                <main className="flex-grow">
                    <Routes>
                        {/* Landing page publique */}
                        <Route path="/" element={<LandingPage />} />
                        
                        {/* Routes publiques */}
                        <Route element={<PublicRoutes />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/dashboard" element={<DashboardCustomer />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/upload" element={<UploadDocument />} />

                        </Route>

                        {/* Routes privées */}
                        <Route element={<PrivateRoutes />}>
                            <Route path="/app" element={<Navigate to="/profile" replace />} />
                            <Route path="/dashboard" element={<DashboardCustomer />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/users" element={<Users />} />
                        </Route>

                        {/* Routes d'erreur */}
                        <Route path="/error" element={<Error />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Fragment>
    );
}