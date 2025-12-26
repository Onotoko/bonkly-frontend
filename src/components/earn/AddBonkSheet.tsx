import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconWallet from '@/assets/icons/icon-wallet.svg';
import iconMemoSrc from '@/assets/icons/icon-memo.svg';

interface AddBonkSheetProps {
    isOpen: boolean;
    onClose: () => void;
    depositAddress: string;
    memo?: string;
}

export function AddBonkSheet({ isOpen, onClose, depositAddress, memo }: AddBonkSheetProps) {
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [copiedMemo, setCopiedMemo] = useState(false);

    if (!isOpen) return null;

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(depositAddress);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopyMemo = async () => {
        if (!memo) return;
        try {
            await navigator.clipboard.writeText(memo);
            setCopiedMemo(true);
            setTimeout(() => setCopiedMemo(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const truncateAddress = (addr: string) => {
        if (addr.length <= 20) return addr;
        return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
    };

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Add BONK</span>
                    <button className="icon-button" onClick={onClose} aria-label="Close">
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                <div className="add-modal-body">
                    {/* Address */}
                    <div className="add-field-group">
                        <p className="add-label">Send BONK to this address:</p>
                        <div className="add-address-row">
                            <span className="add-address-icon">
                                <img src={iconWallet} alt="" />
                            </span>
                            <span className="add-address-text" title={depositAddress}>
                                {truncateAddress(depositAddress)}
                            </span>
                            <button className="add-copy-btn" onClick={handleCopyAddress}>
                                {copiedAddress ? 'Copied!' : 'Copy Address'}
                            </button>
                        </div>
                    </div>

                    {/* Memo */}
                    <div className="add-field-group">
                        <div className="add-address-row">
                            <span className="add-address-icon">
                                <img src={iconMemoSrc} alt="" />
                            </span>
                            <span className="add-address-text">
                                {memo || '{{unique}}'}
                            </span>
                            <button className="add-copy-btn" onClick={handleCopyMemo}>
                                {copiedMemo ? 'Copied!' : 'Copy Memo'}
                            </button>
                        </div>
                    </div>

                    {/* How this works */}
                    <div className="add-field-group">
                        <p className="add-how-title">How this works:</p>
                        <ul className="add-how-list">
                            <li>Send BONK to the address above</li>
                            <li>We credit it to your wallet automatically</li>
                            <li>Minimum deposit: 10 BONK</li>
                            <li>Network: Solana</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}