import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@/hooks/queries';
import { ROUTES } from '@/constants/routes';
import { useUIStore } from '@/stores';

// Assets
import logoSrc from '@/assets/images/bonkly-logo.svg';
import loginBgSrc from '@/assets/images/login-background.png';

export function WelcomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: googleLogin } = useGoogleLogin();
    const { showError } = useUIStore();
    const errorShownRef = useRef(false);

    useEffect(() => {
        const errorMessage = location.state?.error;
        if (errorMessage && !errorShownRef.current) {
            errorShownRef.current = true;
            showError('Login Failed', errorMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, showError]);

    const handleGoogleSignIn = () => {
        googleLogin();
    };

    const handleAppleSignIn = () => {
        showError('Coming Soon', 'Apple Sign In will be available soon!');
    };

    return (
        <div className="welcome-screen">
            {/* Sky section with background */}
            <div
                className="welcome-sky"
                style={{ backgroundImage: `url(${loginBgSrc})` }}
            >
                <img
                    src={logoSrc}
                    alt="Bonkly"
                    className="welcome-logo"
                />
            </div>

            {/* Panel section */}
            <main className="welcome-panel">
                <div className="welcome-hero-copy">
                    <h1 className="welcome-hero-title">Welcome, degen.</h1>
                    <p className="welcome-hero-subtitle">
                        You're one BONK away from monetizing your meme addiction.
                    </p>
                </div>

                <div className="welcome-cta-stack">
                    <div className="welcome-cta-buttons">
                        <button
                            className="welcome-btn welcome-btn-google"
                            onClick={handleGoogleSignIn}
                        >
                            Sign in with Google
                        </button>
                        <button
                            className="welcome-btn welcome-btn-apple"
                            onClick={handleAppleSignIn}
                        >
                            Sign in with Apple
                        </button>
                    </div>
                    <p className="welcome-terms">
                        By continuing, you agree to our{' '}
                        <a
                            href={ROUTES.TERMS}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(ROUTES.TERMS);
                            }}
                        >
                            Terms
                        </a>
                        . Which you obviously didn't read.
                    </p>
                </div>
            </main>
        </div>
    );
}