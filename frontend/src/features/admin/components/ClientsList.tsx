import { Badge } from '@/components/ui';

import type { UserDto } from '@/schemas';

interface ClientsListProps {
    users: UserDto[];
}

export function ClientsList({ users }: ClientsListProps) {
    const getRoleLabel = (roles: string[]) => {
        const role = roles[0]?.toLowerCase() || 'client';
        
        if (role === 'admin') {
            return {
                label: 'Administrateur',
                variant: 'danger' as const,
            };
        }
        
        return {
            label: 'Client',
            variant: 'success' as const,
        };
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Prénom</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Nom</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Rôle</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Date d'inscription</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {users.map((user, idx) => {
                            const { label, variant } = getRoleLabel(user.roles);
                            const createdDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            });

                            return (
                                <tr key={user.id} className={`hover:bg-white/10 transition-colors ${idx % 2 === 0 ? 'bg-white/5' : ''}`}>
                                    <td className="px-6 py-4 text-sm font-medium text-white">{user.first_name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{user.last_name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <Badge variant={variant} size="sm">
                                            {label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{createdDate}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
