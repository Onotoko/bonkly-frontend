import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects to /welcome if not logged in
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to={ROUTES.WELCOME} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}