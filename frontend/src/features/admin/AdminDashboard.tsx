import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Mail,
    Shield,
    Calendar,
    MessageCircle,
} from 'lucide-react';
import { Button, Card, Input, Loader } from '@/components/ui';
import { Sidebar, Footer } from '@/components/layout';
import { useGetAllUsers } from '@/api/queries';
import { useAuthStore } from '@/stores';

import type { UserDto } from '@/schemas';

export function AdminDashboard() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');

    // Récupérer les utilisateurs depuis l'API
    const { data: users = [], isLoading, error } = useGetAllUsers();

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
                <div className="text-center">
                    <Shield className="mx-auto text-red-400 mb-4" size={64} />
                    <p className="text-red-400 mb-4 text-lg font-semibold">Accès refusé</p>
                    <p className="text-slate-400 mb-8">Vous devez être administrateur pour accéder à cette page</p>
                    <Button 
                        variant="primary"
                        onClick={() => navigate('/')}
                    >
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        );
    }

    // Filtrer les utilisateurs selon la recherche et le rôle
    const filteredClients = users.filter((user: UserDto) => {
        const matchesSearch =
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
            roleFilter === 'all' ||
            roleFilter === user.role;

        return matchesSearch && matchesRole;
    });

    // Compter les admins et clients
    const adminsCount = users.filter((u: UserDto) => u.role === 'ADMIN').length;
    const clientsCount = users.filter((u: UserDto) => u.role === 'USER').length;

    // Formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    // Obtenir le label et la couleur du rôle
    const getRoleDisplay = (role: string) => {
        if (role === 'ADMIN') {
            return { label: 'Administrateur', color: 'text-red-400', bgColor: 'bg-red-500/10' };
        }
        return { label: 'Utilisateur', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
    };

    // Handlers pour les actions
    const handleContactClient = (email: string, first_name: string, last_name: string) => {
        window.location.href = `mailto:${email}?subject=Suivi - ${first_name} ${last_name}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Erreur lors du chargement des utilisateurs</p>
                    <p className="text-slate-400">{error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-[#0A0F1C] flex">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    {/* Header fixe */}
                    <div className="p-4 md:p-6 lg:p-8 flex-shrink-0 overflow-x-hidden">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                                Gestion des <span className="text-[#126FFF]">Clients</span>
                            </h1>
                            <p className="text-sm md:text-base text-slate-400 mb-6">
                                Consultez et gérez tous les clients de votre plateforme
                            </p>

                            {/* Cards statistiques */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                <Card className="glass-card" padding="p-4 md:p-6" maxWidth="max-w-none">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center flex-shrink-0">
                                            <Users className="text-[#126FFF]" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white">{users.length}</p>
                                            <p className="text-xs md:text-sm text-slate-400">Total des clients</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="glass-card" padding="p-4 md:p-6" maxWidth="max-w-none">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                            <Shield className="text-red-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white">{adminsCount}</p>
                                            <p className="text-xs md:text-sm text-slate-400">Administrateurs</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="glass-card" padding="p-4 md:p-6" maxWidth="max-w-none">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <Users className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white">{clientsCount}</p>
                                            <p className="text-xs md:text-sm text-slate-400">Utilisateurs</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Barre de recherche et filtres */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    label=""
                                    type="text"
                                    placeholder="Rechercher par prénom, nom ou email..."
                                    name="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-[#126FFF]/30 focus:border-[#126FFF]/50"
                                />
                            </div>
                            
                            {/* Filtre par rôle */}
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    variant={roleFilter === 'all' ? 'primary' : 'outline'}
                                    onClick={() => setRoleFilter('all')}
                                    className="text-sm"
                                >
                                    Tous
                                </Button>
                                <Button
                                    variant={roleFilter === 'ADMIN' ? 'primary' : 'outline'}
                                    onClick={() => setRoleFilter('ADMIN')}
                                    className="text-sm"
                                >
                                    Admin
                                </Button>
                                <Button
                                    variant={roleFilter === 'USER' ? 'primary' : 'outline'}
                                    onClick={() => setRoleFilter('USER')}
                                    className="text-sm"
                                >
                                    Utilisateur
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                    </div>

                    {/* Liste scrollable */}
                    <div className="flex-1 px-4 md:px-6 lg:px-8 overflow-y-auto scroll-smooth overflow-x-hidden">
                        {/* Liste des clients */}
                        <div className="grid gap-4 pb-8">
                        {filteredClients.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <Users className="mx-auto text-slate-600 mb-4" size={64} />
                                <p className="text-slate-400 text-lg">
                                    {searchQuery ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                                </p>
                            </motion.div>
                        ) : (
                            filteredClients.map((client: UserDto, index: number) => {
                                const roleDisplay = getRoleDisplay(client.role);
                                return (
                                    <motion.div
                                        key={client.id}
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
                                                {/* Informations du client */}
                                                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${roleDisplay.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                        <Users className={roleDisplay.color} size={20} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                                                            {client.first_name} {client.last_name}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Mail size={14} />
                                                                <span className="truncate">{client.email}</span>
                                                            </div>
                                                            <span className="text-white/30">•</span>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                <span>{formatDate(client.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rôle */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.color}`}>
                                                        {roleDisplay.label}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        className="flex items-center gap-2 text-sm md:text-base text-slate-300 hover:text-[#126FFF]"
                                                        onClick={() => handleContactClient(client.email, client.first_name, client.last_name)}
                                                        aria-label="Contacter"
                                                    >
                                                        <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                                        <span className="hidden sm:inline">Contacter</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}
