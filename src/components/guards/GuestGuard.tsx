import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

interface GuestGuardProps {
    children: React.ReactNode;
}

/**
 * Protects auth pages from logged-in users
 * Redirects to home if already authenticated
 */
export function GuestGuard({ children }: GuestGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        // If user needs activation, redirect to activate page
        if (!user?.isActivated) {
            return <Navigate to={ROUTES.ACTIVATE} replace />;
        }

        // Redirect to the page they tried to visit, or home
        const from = location.state?.from?.pathname || ROUTES.HOME;
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}