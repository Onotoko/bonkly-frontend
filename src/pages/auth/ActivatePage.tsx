import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Assets
import onboardingBgSrc from '@/assets/images/onboarding-background.png';
import ornamentSrc from '@/assets/images/ornament-referral.png';
import bgConfettiSrc from '@/assets/images/bg-confetti.png';
import rectangleSrc from '@/assets/images/rectangle-referral.svg';
import ufoSrc from '@/assets/illustrations/ufo.png';
import iconWalletSrc from '@/assets/icons/icon-wallet.svg';
import iconMemoSrc from '@/assets/icons/icon-memo.svg';

export function ActivatePage() {
    const navigate = useNavigate();
    const [copiedField, setCopiedField] = useState<'wallet' | 'memo' | null>(null);

    const walletAddress = '12903jklsadjksadhasdy78293893242';
    const memoCode = '{{unique}}';

    const handleCopy = async (text: string, field: 'wallet' | 'memo') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleProceed = () => {
        navigate(ROUTES.ACTIVATE_SUCCESS);
    };

    const handleBack = () => {
        navigate(-1);
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
                        Deposit 40K BONK to unlock posting rights.
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

                    <div className="cta-row">
                        <button
                            className="btn cta-primary"
                            onClick={handleProceed}
                        >
                            I've Bonked → Proceed
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