import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Assets
import onboardingBgSrc from '@/assets/images/onboarding-background.png';
import ornamentSrc from '@/assets/images/ornament-referral.png';
import bgConfettiSrc from '@/assets/images/bg-confetti.png';
import rectangleSrc from '@/assets/images/rectangle-referral.svg';
import laughSrc from '@/assets/illustrations/laugh.png';

export function ActivateSuccessPage() {
    const navigate = useNavigate();

    const handleStartLaughing = () => {
        navigate(ROUTES.HOME);
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
                        <span className="dot"></span>
                        <span className="dot active"></span>
                    </div>
                </header>

                {/* Title */}
                <h1 className="slide-title">
                    You did it, Meme Overlord
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
                        src={laughSrc}
                        alt="Laughing emoji"
                        className="artwork-icon artwork-icon-large"
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
                        Your BONK has landed, your Laughs are loaded, and your meme wallet is live.
                    </p>

                    <p className="slide-body-highlight">
                        You can now post, Love, and Laugh your way to fame (and BONK).
                    </p>

                    <div className="cta-row">
                        <button
                            className="btn cta-primary"
                            onClick={handleStartLaughing}
                        >
                            Start Laughing →
                        </button>
                        <p className="fine-print">
                            Post your first meme and make the internet lose it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}