import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconPaste from '@/assets/icons/icon-paste.svg';

interface WithdrawSheetProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onSubmit: (amount: number, address: string) => void;
    isLoading?: boolean;
}

export function WithdrawSheet({
    isOpen,
    onClose,
    balance,
    onSubmit,
    isLoading = false,
}: WithdrawSheetProps) {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setAddress(text);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || !address.trim()) return;
        onSubmit(numAmount, address.trim());
    };

    const formatBalance = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount >= 10 && numAmount <= balance && address.trim().length > 30;

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Withdraw BONK</span>
                    <button
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isLoading}
                    >
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                <div className="withdraw-modal-body">
                    <div className="withdraw-balance">
                        Balance:{' '}
                        <span className="power-badge green">
                            <img src={iconBonk} alt="" />
                            {formatBalance(balance)}
                        </span>
                    </div>

                    <div className="withdraw-fields">
                        <input
                            type="number"
                            className="withdraw-input"
                            placeholder="Enter how much BONK you want to withdraw..."
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />

                        <div className="withdraw-address-row">
                            <input
                                type="text"
                                className="withdraw-input"
                                placeholder="Paste your SOL address here..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                className="withdraw-paste-btn"
                                onClick={handlePaste}
                                disabled={isLoading}
                            >
                                <img src={iconPaste} alt="" />
                                Paste
                            </button>
                        </div>

                        <div className="withdraw-note">
                            <span>Minimum amount: 10 Bonk</span>
                            <span>Network fees apply</span>
                        </div>
                    </div>

                    <button
                        className="withdraw-cta"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Withdraw Bonk'}
                    </button>
                </div>
            </div>
        </div>
    );
}