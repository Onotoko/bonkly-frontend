import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui';

/**
 * Handles OAuth callback from Google/Apple
 * 
 * Backend redirects here with base64url encoded data:
 * - Success: ?auth=base64(accessToken, refreshToken, user)
 * - Needs Referral: redirects to /referral?data=base64(tempData)
 * - Needs Activation: redirects to /activate?data=base64(userData)
 * - Error: ?error=xxx
 */
export function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuthStore();

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

            // Check for auth data (successful login)
            const authParam = searchParams.get('auth');
            if (authParam) {
                try {
                    const decoded = atob(authParam);
                    const authData = JSON.parse(decoded);
                    setAuth(authData.user, authData.accessToken, authData.refreshToken);

                    // Check if user is activated
                    if (!authData.user.isActivated) {
                        navigate(ROUTES.ACTIVATE, {
                            state: { depositAddress: authData.depositAddress },
                            replace: true
                        });
                    } else {
                        navigate(ROUTES.HOME, { replace: true });
                    }
                    return;
                } catch (e) {
                    console.error('Failed to parse auth data:', e);
                }
            }

            // Fallback - something went wrong
            navigate(ROUTES.WELCOME, {
                state: { error: 'Something went wrong. Please try again.' },
                replace: true
            });
        };

        handleCallback();
    }, [searchParams, navigate, setAuth]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <PageLoader />
            <p className="mt-4 text-gray-500">Completing login...</p>
        </div>
    );
}