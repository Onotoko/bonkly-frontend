import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

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
                    <div className="power-balances">
                        <div className="power-balance-item">
                            <span className="power-balance-label">Laugh Power Balance</span>
                            <span className="power-badge yellow">
                                <img src={iconBonk} alt="" />
                                {formatBalance(dBonkBalance)}
                            </span>
                        </div>
                        <div className="power-balance-item">
                            <span className="power-balance-label">Bonk Balance</span>
                            <span className="power-badge red">
                                <img src={iconBonk} alt="" />
                                {formatBalance(bonkBalance)}
                            </span>
                        </div>
                    </div>

                    <input
                        type="number"
                        className="power-input"
                        placeholder="Enter amount in Bonk to power up"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLoading}
                    />

                    <div className="power-copy">
                        <p>
                            <strong>1 BONK → 15 dBONK</strong>
                        </p>
                        <p>
                            Powering up converts BONK into Laugh Power (dBONK), increasing your
                            influence.
                        </p>
                    </div>

                    <button
                        className="power-cta"
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