import { useState, useMemo } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

// Constants - match backend
const BONK_TO_DBONK_RATE = 15;

interface PowerUpSheetProps {
    isOpen: boolean;
    onClose: () => void;
    bonkBalance: number;
    dBonkBalance: number;
    onSubmit: (amount: number) => void;
    isLoading?: boolean;
}

export function PowerUpSheet({
    isOpen,
    onClose,
    bonkBalance,
    dBonkBalance,
    onSubmit,
    isLoading = false,
}: PowerUpSheetProps) {
    const [amount, setAmount] = useState('');

    // Calculate preview
    const preview = useMemo(() => {
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0) return null;

        const dbonkReceived = numAmount * BONK_TO_DBONK_RATE;
        const newTotalDBonk = dBonkBalance + dbonkReceived;

        return {
            dbonkReceived,
            newTotalDBonk,
        };
    }, [amount, dBonkBalance]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        onSubmit(numAmount);
    };

    const handleMax = () => {
        setAmount(String(bonkBalance));
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        if (num < 1 && num > 0) return num.toFixed(4);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount > 0 && numAmount <= bonkBalance;

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Power Up</span>
                    <button
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isLoading}
                    >
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                <div className="power-modal-body">
                    {/* Balances Row */}
                    <div className="power-balances-row">
                        <div className="power-balance-item">
                            <span className="power-balance-label">BONK Balance</span>
                            <span className="power-badge red">
                                <img src={iconBonk} alt="" />
                                {formatNumber(bonkBalance)}
                            </span>
                        </div>
                        <div className="power-balance-item">
                            <span className="power-balance-label">Laugh Power</span>
                            <span className="power-badge green">
                                <img src={iconLaughWeight} alt="" />
                                {formatNumber(dBonkBalance)}
                            </span>
                        </div>
                    </div>

                    {/* Input with Max button */}
                    <div className="power-input-wrapper">
                        <input
                            type="number"
                            className="power-input"
                            placeholder="Enter BONK amount to convert"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            className="power-max-btn"
                            onClick={handleMax}
                            disabled={isLoading}
                        >
                            MAX
                        </button>
                    </div>

                    {/* Conversion Rate */}
                    <div className="power-rate">
                        <span>1 BONK</span>
                        <span className="power-rate-arrow">→</span>
                        <span>{BONK_TO_DBONK_RATE} Laugh Power</span>
                    </div>

                    {/* Preview */}
                    {preview && isValid && (
                        <div className="power-preview">
                            <div className="power-preview-row">
                                <span>You will receive</span>
                                <span className="power-preview-value green">
                                    <img src={iconLaughWeight} alt="" />
                                    +{formatNumber(preview.dbonkReceived)}
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>New Laugh Power</span>
                                <span className="power-preview-value">
                                    <img src={iconLaughWeight} alt="" />
                                    {formatNumber(preview.newTotalDBonk)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <p className="power-description">
                        Power Up converts your BONK into <strong>Laugh Power</strong>, which
                        increases your influence when curating memes. Higher Laugh Power means
                        bigger curation rewards! Laugh Power can be converted back to BONK via
                        Power Down (8 weeks).
                    </p>

                    {/* CTA */}
                    <button
                        className="power-cta power-cta-green"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Power Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}