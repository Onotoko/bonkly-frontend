import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useValidateReferral, useCompleteSignup } from '@/hooks/queries';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants/routes';
import type { TempData } from '@/types/api';

// Assets
import onboardingBgSrc from '@/assets/images/onboarding-background.png';
import ornamentSrc from '@/assets/images/ornament-referral.png';
import bgConfettiSrc from '@/assets/images/bg-confetti.png';
import rectangleSrc from '@/assets/images/rectangle-referral.svg';
import securitySrc from '@/assets/images/security.png';

const CODE_LENGTH = 6;

export function ReferralPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { tempData, setTempData } = useAuthStore();
    const { mutate: validateReferral, isPending: isValidating } = useValidateReferral();
    const { mutate: completeSignup, isPending: isSigningUp } = useCompleteSignup();

    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [referrerName, setReferrerName] = useState<string | null>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const fullCode = code.join('');
    const isPending = isValidating || isSigningUp;

    // Parse tempData from URL if present
    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam && !tempData) {
            try {
                const decoded = atob(dataParam);
                const parsed = JSON.parse(decoded) as TempData;
                setTempData(parsed);
            } catch (e) {
                console.error('Failed to parse tempData from URL:', e);
                navigate(ROUTES.WELCOME, {
                    state: { error: 'Invalid session. Please try again.' },
                    replace: true
                });
            }
        }
    }, [searchParams, tempData, setTempData, navigate]);

    // Redirect if no tempData
    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (!tempData && !dataParam) {
            navigate(ROUTES.WELCOME, { replace: true });
        }
    }, [tempData, searchParams, navigate]);

    const handleCodeStackClick = () => {
        hiddenInputRef.current?.focus();
    };

    const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
        const newCode = Array(CODE_LENGTH).fill('');
        for (let i = 0; i < value.length; i++) {
            newCode[i] = value[i];
        }
        setCode(newCode);
        setError('');
        setReferrerName(null);
    };

    const handleSubmit = () => {
        if (fullCode.length !== CODE_LENGTH) {
            setError('Please enter the full code');
            return;
        }

        if (!tempData) {
            setError('Session expired. Please start over.');
            return;
        }

        // Step 1: Validate referral code
        validateReferral(fullCode, {
            onSuccess: (response) => {
                if (!response.valid) {
                    setError('Invalid referral code');
                    return;
                }

                setReferrerName(response.referrer?.displayName || response.referrer?.username || null);

                // Step 2: Complete signup
                const provider = tempData.googleId ? 'google' : 'apple';
                completeSignup(
                    {
                        provider,
                        providerData: tempData,
                        referralCode: fullCode,
                    },
                    {
                        onSuccess: (authResponse) => {
                            // useCompleteSignup already handles setAuth
                            navigate(ROUTES.ACTIVATE, {
                                state: { depositAddress: authResponse.depositAddress },
                                replace: true
                            });
                        },
                        onError: (err) => {
                            setError(err.message || 'Signup failed. Please try again.');
                        },
                    }
                );
            },
            onError: (err) => {
                setError(err.message || 'Invalid referral code');
            },
        });
    };

    const isComplete = code.every((c) => c !== '');

    return (
        <div className="onboarding-shell">
            {/* Background */}
            <img
                src={onboardingBgSrc}
                alt=""
                className="onboarding-bg"
                aria-hidden="true"
            />

            {/* Hero section */}
            <div className="onboarding-hero">
                {/* Header dots */}
                <header className="onboarding-header">
                    <div className="dot-row">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </header>

                {/* Title */}
                <h1 className="slide-title">
                    Access denied to normies
                </h1>

                {/* Artwork */}
                <div className="onboarding-artwork-wrapper">
                    <img
                        src={bgConfettiSrc}
                        alt=""
                        className="artwork-confetti"
                        aria-hidden="true"
                    />
                    <img
                        src={ornamentSrc}
                        alt=""
                        className="artwork-ornament"
                        aria-hidden="true"
                    />
                    <img
                        src={securitySrc}
                        alt="Security badge"
                        className="artwork-icon"
                    />
                </div>
            </div>

            {/* Content area with rectangle background */}
            <div className="onboarding-content">
                {/* Rectangle background with wave top */}
                <img
                    src={rectangleSrc}
                    alt=""
                    className="onboarding-rectangle-bg"
                    aria-hidden="true"
                />

                <div className="onboarding-inner">
                    <p className="slide-subhead">
                        You're one BONK away from monetizing your meme addiction.
                    </p>

                    <p className="slide-helper">
                        Got the code? Prove your meme worth.
                    </p>

                    <div className="code-block">
                        <div
                            className="code-stack"
                            onClick={handleCodeStackClick}
                        >
                            <div className="code-entry">
                                {code.map((char, index) => (
                                    <div
                                        key={index}
                                        className={`code-box ${error ? 'error' : ''}`}
                                    >
                                        {char}
                                    </div>
                                ))}
                            </div>
                            <input
                                ref={hiddenInputRef}
                                className="code-input"
                                type="text"
                                inputMode="text"
                                maxLength={CODE_LENGTH}
                                value={fullCode}
                                onChange={handleHiddenInputChange}
                                autoComplete="off"
                                aria-label="6 digit code"
                            />
                        </div>
                        <p className="code-hint">Your alphanumeric proof of coolness</p>
                    </div>

                    {error && <p className="slide-error">{error}</p>}
                    {referrerName && !error && (
                        <p className="slide-success">Referred by {referrerName}</p>
                    )}

                    <div className="cta-row">
                        <button
                            className="btn cta-primary"
                            onClick={handleSubmit}
                            disabled={!isComplete || isPending}
                        >
                            {isPending ? (
                                <span className="spinner" />
                            ) : (
                                'Unlock the chaos'
                            )}
                        </button>
                        <p className="link-row">
                            No code? Beg someone on{' '}
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                X
                            </a>
                            {' '}or{' '}
                            <a
                                href="https://t.me"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Telegram
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}