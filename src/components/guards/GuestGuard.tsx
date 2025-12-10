import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

interface GuestGuardProps {
    children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    // Not authenticated - allow access to guest pages
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // Authenticated but not activated - only allow activate page
    if (!user?.isActivated) {
        if (location.pathname === ROUTES.ACTIVATE) {
            return <>{children}</>;
        }
        return <Navigate to={ROUTES.ACTIVATE} replace />;
    }

    // Fully authenticated and activated - redirect to home
    const from = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
}