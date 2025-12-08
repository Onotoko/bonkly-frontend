import { useState, useMemo, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useCheckDeposit } from '@/hooks/queries';
import { ROUTES } from '@/constants/routes';

// Assets
import onboardingBgSrc from '@/assets/images/onboarding-background.png';
import ornamentSrc from '@/assets/images/ornament-referral.png';
import bgConfettiSrc from '@/assets/images/bg-confetti.png';
import rectangleSrc from '@/assets/images/rectangle-referral.svg';
import ufoSrc from '@/assets/illustrations/ufo.png';
import iconWalletSrc from '@/assets/icons/icon-wallet.svg';
import iconMemoSrc from '@/assets/icons/icon-memo.svg';

interface ActivateData {
    userId: string;
    email: string;
    solanaAddress: string;
}

const MIN_DEPOSIT = 40000;
const POLL_INTERVAL = 10000; // 10 seconds

export function ActivatePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();

    const [copiedField, setCopiedField] = useState<'wallet' | 'memo' | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);

    // Deposit checking with polling
    const {
        isPolling,
        isChecking,
        data: checkResult,
        startPolling,
        stopPolling,
        checkOnce,
    } = useCheckDeposit({
        pollingInterval: POLL_INTERVAL,
        onActivated: (result) => {
            navigate(ROUTES.ACTIVATE_SUCCESS, {
                state: {
                    bonkBalance: result.bonkRewardPool,
                    dbonkBalance: result.dBonk,
                    amount: result.amount,
                },
                replace: true,
            });
        },
        onError: (error) => {
            setCheckError(error.message || 'Failed to check deposit');
        },
    });

    // Get deposit address from: location state > URL params > user store
    const activateData = useMemo<ActivateData | null>(() => {
        // From location state (after signup)
        const stateAddress = location.state?.depositAddress;
        if (stateAddress && user) {
            return {
                userId: user._id,
                email: user.email,
                solanaAddress: stateAddress,
            };
        }

        // From URL params (redirect from backend)
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decoded = atob(dataParam);
                return JSON.parse(decoded) as ActivateData;
            } catch (e) {
                console.error('Failed to parse activate data:', e);
            }
        }

        // From user store
        if (user?.solanaAddress) {
            return {
                userId: user._id,
                email: user.email,
                solanaAddress: user.solanaAddress,
            };
        }

        return null;
    }, [location.state, searchParams, user]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    if (!activateData) {
        return <Navigate to={ROUTES.WELCOME} replace />;
    }

    const walletAddress = activateData.solanaAddress;
    const memoCode = activateData.userId;

    const handleCopy = async (text: string, field: 'wallet' | 'memo') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCheckDeposit = () => {
        setCheckError(null);
        if (isPolling) {
            // Already polling, just do a manual check
            checkOnce();
        } else {
            // Start polling
            startPolling();
        }
    };

    const handleBack = () => {
        stopPolling();
        navigate(ROUTES.WELCOME);
    };

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
                        <span className="dot"></span>
                        <span className="dot active"></span>
                        <span className="dot"></span>
                    </div>
                </header>

                {/* Title */}
                <h1 className="slide-title">
                    It's time to put your BONK where your meme is
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
                        src={ufoSrc}
                        alt="UFO"
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
                        Deposit {MIN_DEPOSIT.toLocaleString()}+ BONK to unlock posting rights.
                    </p>

                    <div className="note-card">
                        <ul>
                            <li>
                                <span className="bullet"></span>
                                80% becomes your Super Vote ammo
                            </li>
                            <li>
                                <span className="bullet"></span>
                                20% keeps the meme servers running
                            </li>
                        </ul>
                    </div>

                    <div className="input-row">
                        <div className="input-chip">
                            <img
                                src={iconWalletSrc}
                                alt=""
                                className="chip-icon"
                            />
                            <span className="chip-text">{walletAddress}</span>
                            <button
                                className="chip-action"
                                onClick={() => handleCopy(walletAddress, 'wallet')}
                            >
                                {copiedField === 'wallet' ? 'Copied!' : 'Copy Address'}
                            </button>
                        </div>
                        <div className="input-chip">
                            <img
                                src={iconMemoSrc}
                                alt=""
                                className="chip-icon"
                            />
                            <span className="chip-placeholder">{memoCode}</span>
                            <button
                                className="chip-action"
                                onClick={() => handleCopy(memoCode, 'memo')}
                            >
                                {copiedField === 'memo' ? 'Copied!' : 'Copy Memo'}
                            </button>
                        </div>
                    </div>

                    <p className="fine-print">
                        Make sure to add the memo or your deposit will be lost
                    </p>

                    {/* Status messages */}
                    {isPolling && !checkResult?.found && (
                        <div className="status-card status-polling">
                            <span className="spinner spinner-small" />
                            <span>Watching for your deposit...</span>
                        </div>
                    )}

                    {checkResult?.found === false && checkResult?.message && !isPolling && (
                        <p className="slide-info">{checkResult.message}</p>
                    )}

                    {checkError && (
                        <p className="slide-error">{checkError}</p>
                    )}

                    <div className="cta-row">
                        <button
                            className="btn cta-primary"
                            onClick={handleCheckDeposit}
                            disabled={isChecking}
                        >
                            {isChecking ? (
                                <span className="spinner" />
                            ) : isPolling ? (
                                'Checking...'
                            ) : (
                                "I've Bonked → Check Deposit"
                            )}
                        </button>
                        <button
                            className="btn cta-back"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}