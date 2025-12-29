import { useState, useMemo } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

// Constants - match backend
const BONK_TO_DBONK_RATE = 15;
const POWER_DOWN_WEEKS = 8;

interface PowerDownSheetProps {
    isOpen: boolean;
    onClose: () => void;
    dBonkBalance: number;
    onSubmit: (amount: number) => void;
    isLoading?: boolean;
}

export function PowerDownSheet({
    isOpen,
    onClose,
    dBonkBalance,
    onSubmit,
    isLoading = false,
}: PowerDownSheetProps) {
    const [amount, setAmount] = useState('');

    // Calculate preview values
    const preview = useMemo(() => {
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0) return null;

        const totalBonk = numAmount / BONK_TO_DBONK_RATE;
        const weeklyBonk = totalBonk / POWER_DOWN_WEEKS;
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + POWER_DOWN_WEEKS * 7);

        return {
            totalBonk,
            weeklyBonk,
            completionDate,
        };
    }, [amount]);

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
        setAmount(String(dBonkBalance));
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        if (num < 1) return num.toFixed(4);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount > 0 && numAmount <= dBonkBalance;

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Power Down</span>
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
                    {/* Balance - Centered */}
                    <div className="power-balance-center">
                        <span className="power-balance-label">Laugh Power Balance</span>
                        <span className="power-badge green">
                            <img src={iconLaughWeight} alt="" />
                            {formatNumber(dBonkBalance)}
                        </span>
                    </div>

                    {/* Input with Max button */}
                    <div className="power-input-wrapper">
                        <input
                            type="number"
                            className="power-input"
                            placeholder="Enter amount to power down"
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

                    {/* Preview */}
                    {preview && isValid && (
                        <div className="power-preview">
                            <div className="power-preview-row">
                                <span>You will receive</span>
                                <span className="power-preview-value">
                                    <img src={iconBonk} alt="" />
                                    {formatNumber(preview.totalBonk)} BONK
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>Weekly payout</span>
                                <span className="power-preview-value">
                                    <img src={iconBonk} alt="" />
                                    ~{formatNumber(preview.weeklyBonk)} BONK
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>Completes on</span>
                                <span className="power-preview-value">
                                    {formatDate(preview.completionDate)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <p className="power-description">
                        When you Power Down, the amount you choose begins unlocking over{' '}
                        <strong>8 weeks</strong>. Each week, <strong>1/8</strong> of the amount
                        becomes available in your wallet as BONK. You can cancel anytime and
                        keep the BONK already received.
                    </p>

                    {/* CTA */}
                    <button
                        className="power-cta"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Start Power Down'}
                    </button>
                </div>
            </div>
        </div>
    );
}