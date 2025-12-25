import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

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

    const formatBalance = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
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
                    <div className="power-balance-item">
                        <span className="power-balance-label">Laugh Power Balance</span>
                        <span className="power-badge yellow">
                            <img src={iconBonk} alt="" />
                            {formatBalance(dBonkBalance)}
                        </span>
                    </div>

                    <input
                        type="number"
                        className="power-input"
                        placeholder="Enter amount to power down"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLoading}
                    />

                    <div className="power-copy">
                        <p>
                            When you Power Down, the amount you choose begins unlocking over{' '}
                            <strong>8 weeks</strong>. Each week, <strong>1/8</strong> of the amount
                            becomes available in your Earn Wallet as BONK. You can cancel the Power
                            Down anytime.
                        </p>
                    </div>

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