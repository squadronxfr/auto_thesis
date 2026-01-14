import ErrorPage from '@/features/Error';

import { useMetadata } from '@/lib';

import { useAuthStore } from '@/stores';

export function Profile() {
    const { user } = useAuthStore();

    const { helmet } = useMetadata({
        title: 'Profil',
        description: 'Auto Thesis - Profil',
        keywords:
            'cash flow, finance, gestion financière, comptabilité, budget, trésorerie, profil',
    });

    if (!user) {
        return <ErrorPage statusCode={404} message="User not found" />;
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center">
            {helmet}
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">{user?.firstName}</p>
                <p className="text-sm text-gray-500">{user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.roles}</p>
            </div>
        </div>
    );
}
