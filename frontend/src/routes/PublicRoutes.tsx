import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

export function PublicRoutes() {
    const { isAuthenticated } = useAuthStore();

    return !isAuthenticated ? <Outlet /> : <Navigate to="/profile" replace />;
}
