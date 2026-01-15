import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

export function PrivateRoutes() {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
