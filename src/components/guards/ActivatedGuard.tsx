import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

interface ActivatedGuardProps {
    children: React.ReactNode;
}

/**
 * Protects routes that require account activation (40K BONK deposit)
 * Redirects to /activate if not activated
 * Must be used inside AuthGuard
 */
export function ActivatedGuard({ children }: ActivatedGuardProps) {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!user?.isActivated) {
        return <Navigate to={ROUTES.ACTIVATE} replace />;
    }

    return <>{children}</>;
}