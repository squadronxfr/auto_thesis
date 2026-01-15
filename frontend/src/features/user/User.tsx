import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Pencil, Trash } from 'lucide-react';

import { useDeleteUser, useGetUserById, useUpdateUser } from '@/api/queries';

import { Button, Loader } from '@/components/ui';

import ErrorPage from '@/features/Error';

import { useMetadata } from '@/lib/metadata';

import { UserUpdateDto } from '@/schemas';

import { UserUpdate } from './components';

export function User() {
    const [isOpen, setIsOpen] = useState(false);
    const { id } = useParams();

    // Les hooks doivent être appelés au début du composant, avant toute condition
    const { data: user, isLoading } = useGetUserById(id || '');
    const { mutate: updateUser } = useUpdateUser();
    const { mutate: deleteUser } = useDeleteUser();

    const { helmet } = useMetadata({
        title: 'Utilisateur',
        description: 'Auto Thesis - Utilisateur',
        keywords:
            'Auto Thesis, utilisateur, profil, compte',
    });

    /**
     * Gère la mise à jour d'un utilisateur
     * @param {UserUpdateDto} userData - Les données de l'utilisateur à mettre à jour
     */
    const handleUpdateUser = (userData: UserUpdateDto) => {
        if (id) {
            updateUser({ userId: id, user: userData });
            setIsOpen(false);
        }
    };

    /**
     * Gère la suppression d'un utilisateur
     */
    const handleDeleteUser = () => {
        if (id) {
            deleteUser(id);
        }
    };

    if (!id) {
        return <ErrorPage statusCode={404} message="User not found" />;
    }

    if (isLoading) {
        return <Loader />;
    }

    if (!user) {
        return <ErrorPage statusCode={404} message="User not found" />;
    }

    return (
        <div>
            {helmet}
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">{user?.email}</h1>
            </div>
            <UserUpdate
                user={user}
                onSubmit={handleUpdateUser}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
            <div className="flex gap-2">
                <Button variant="primary" onClick={() => setIsOpen(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="primary" onClick={handleDeleteUser}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
