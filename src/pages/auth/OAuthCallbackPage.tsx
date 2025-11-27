import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

/**
 * Handles OAuth callback from Google/Apple
 * 
 * Backend redirects here with query params:
 * - Success: ?accessToken=xxx&refreshToken=xxx&user=xxx
 * - Needs Referral: ?needsReferral=true&tempData=xxx
 * - Needs Activation: ?needsActivation=true&accessToken=xxx...
 * - Error: ?error=xxx
 */
export function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth, setTempData } = useAuthStore();

    useEffect(() => {
        const handleCallback = () => {
            // Check for error
            const error = searchParams.get('error');
            if (error) {
                console.error('OAuth error:', error);
                navigate(ROUTES.WELCOME, {
                    state: { error: 'Login failed. Please try again.' },
                    replace: true
                });
                return;
            }

            // Check if needs referral (new user)
            const needsReferral = searchParams.get('needsReferral') === 'true';
            if (needsReferral) {
                const tempDataStr = searchParams.get('tempData');
                if (tempDataStr) {
                    try {
                        const tempData = JSON.parse(decodeURIComponent(tempDataStr));
                        setTempData(tempData);
                        navigate(ROUTES.REFERRAL, { replace: true });
                        return;
                    } catch (e) {
                        console.error('Failed to parse tempData:', e);
                    }
                }
                navigate(ROUTES.WELCOME, { replace: true });
                return;
            }

            // Check for tokens (existing user or completed signup)
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const userStr = searchParams.get('user');

            if (accessToken && refreshToken && userStr) {
                try {
                    const user = JSON.parse(decodeURIComponent(userStr));
                    setAuth(user, accessToken, refreshToken);

                    // Check if needs activation
                    const needsActivation = searchParams.get('needsActivation') === 'true';
                    if (needsActivation || !user.isActivated) {
                        navigate(ROUTES.ACTIVATE, { replace: true });
                    } else {
                        navigate(ROUTES.HOME, { replace: true });
                    }
                    return;
                } catch (e) {
                    console.error('Failed to parse user:', e);
                }
            }

            // Fallback - something went wrong
            navigate(ROUTES.WELCOME, {
                state: { error: 'Something went wrong. Please try again.' },
                replace: true
            });
        };

        handleCallback();
    }, [searchParams, navigate, setAuth, setTempData]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <PageLoader />
            <p className="mt-4 text-gray-500">Completing login...</p>
        </div>
    );
}