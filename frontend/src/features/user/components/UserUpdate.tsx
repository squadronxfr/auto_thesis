import { useForm } from 'react-hook-form';

import { Mail, User, X } from 'lucide-react';

import { Button, Input } from '@/components/ui';

import { UserDto, UserUpdateDto, userUpdateSchema } from '@/schemas';

import { zodResolver } from '@hookform/resolvers/zod';

interface UserUpdateProps {
    user: UserDto;
    onSubmit: (user: UserUpdateDto) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function UserUpdate({ user, onSubmit, isOpen, onClose }: UserUpdateProps) {
    const { handleSubmit, register } = useForm<UserUpdateDto>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Modifier le consultant</h2>
                    <div
                        onClick={onClose}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex w-full gap-4">
                        <div className="flex-1">
                            <Input
                                label="Nom"
                                {...register('lastName')}
                                type="text"
                                placeholder="Nom du consultant"
                                rightIcon={<User className="h-4 w-4 text-gray-500" />}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="Prénom"
                                {...register('firstName')}
                                type="text"
                                placeholder="Prénom du consultant"
                                rightIcon={<User className="h-4 w-4 text-gray-500" />}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="Email"
                                {...register('email')}
                                type="email"
                                placeholder="Email du consultant"
                                rightIcon={<Mail className="h-4 w-4 text-gray-500" />}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button type="button" variant="primary" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="primary">
                            Modifier
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
