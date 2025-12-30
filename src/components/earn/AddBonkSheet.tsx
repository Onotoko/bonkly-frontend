import { useState, useEffect } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconWallet from '@/assets/icons/icon-wallet.svg';
import iconCopy from '@/assets/icons/icon-copy.svg';
import iconMemo from '@/assets/icons/icon-memo.svg';

import { useDepositInfo } from '@/hooks/queries/useWallet';
import { useCheckAddDeposit } from '@/hooks/queries/useCheckDeposit';

interface AddBonkSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (amount: number) => void;
}

const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 60;

// Inner component that resets when remounted
function AddBonkSheetContent({ onClose, onSuccess }: Omit<AddBonkSheetProps, 'isOpen'>) {
    const [copiedField, setCopiedField] = useState<'address' | 'memo' | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);

    // Get deposit info
    const depositInfoQuery = useDepositInfo();
    const depositInfo = depositInfoQuery.data;

    // Polling hook
    const {
        isPolling,
        isChecking,
        data: checkResult,
        error: checkErrorObj,
        startPolling,
        stopPolling,
        checkOnce,
    } = useCheckAddDeposit({
        pollingInterval: POLL_INTERVAL,
        maxAttempts: MAX_ATTEMPTS,
        onSuccess: (result) => {
            if (result.amount) {
                onSuccess?.(result.amount);
                onClose();
            }
        },
        onError: (error) => {
            setCheckError(error.message || 'Failed to check deposit');
        },
        onTimeout: () => {
            setCheckError('Timed out. Please click the button to try again.');
        },
    });

    // Derive error message
    const displayError = checkError || (checkErrorObj?.message ?? null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isPolling) {
            onClose();
        }
    };

    const handleCopy = async (text: string, field: 'address' | 'memo') => {
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
        if (!isPolling) {
            startPolling();
        }
        checkOnce();
    };

    const truncateAddress = (addr: string) => {
        if (!addr || addr.length <= 20) return addr || '';
        return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
    };

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Add BONK</span>
                    <button
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isPolling}
                    >
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                <div className="add-modal-body">
                    {depositInfoQuery.isLoading ? (
                        <div className="earn-loading">Loading...</div>
                    ) : depositInfo ? (
                        <>
                            {/* Address */}
                            <div className="add-field-group">
                                <p className="add-label">Send BONK to this address:</p>
                                <div className="add-address-row">
                                    <span className="add-address-icon">
                                        <img src={iconWallet} alt="" />
                                    </span>
                                    <span
                                        className="add-address-text"
                                        title={depositInfo.depositAddress}
                                    >
                                        {truncateAddress(depositInfo.depositAddress)}
                                    </span>
                                    <button
                                        className="add-copy-btn"
                                        onClick={() =>
                                            handleCopy(depositInfo.depositAddress, 'address')
                                        }
                                    >
                                        <img src={iconCopy} alt="" />
                                        {copiedField === 'address' ? 'Copied!' : 'Copy Address'}
                                    </button>
                                </div>
                            </div>

                            {/* Memo */}
                            <div className="add-field-group">
                                <div className="add-address-row">
                                    <span className="add-address-icon">
                                        <img src={iconMemo} alt="" />
                                    </span>
                                    <span className="add-address-text">{depositInfo.memo}</span>
                                    <button
                                        className="add-copy-btn"
                                        onClick={() => handleCopy(depositInfo.memo, 'memo')}
                                    >
                                        <img src={iconCopy} alt="" />
                                        {copiedField === 'memo' ? 'Copied!' : 'Copy Memo'}
                                    </button>
                                </div>
                            </div>

                            {/* How this works */}
                            <div className="add-field-group">
                                <p className="add-how-title">How this works:</p>
                                <ul className="add-how-list">
                                    <li>Send BONK to the address above</li>
                                    <li>We credit it to your wallet automatically</li>
                                    <li>Minimum deposit: {depositInfo.minDeposit} BONK</li>
                                    <li>Network: Solana</li>
                                </ul>
                            </div>

                            {/* Polling Status */}
                            {isPolling && (
                                <div className="add-polling-status">
                                    <div className="add-polling-spinner" />
                                    <span>Watching for your deposit...</span>
                                    <button
                                        className="add-polling-cancel"
                                        onClick={stopPolling}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {/* Error message - show timeout and other errors */}
                            {!isPolling && displayError && (
                                <p className="add-error">{displayError}</p>
                            )}

                            {/* Info message when not found (only if no error) */}
                            {!isPolling &&
                                !displayError &&
                                checkResult?.found === false &&
                                checkResult?.message && (
                                    <p className="add-info">{checkResult.message}</p>
                                )}

                            {/* Check Button */}
                            {!isPolling && (
                                <button
                                    className="add-check-btn"
                                    onClick={handleCheckDeposit}
                                    disabled={isChecking}
                                >
                                    {isChecking ? 'Checking...' : "I've sent the BONK"}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="earn-empty">
                            <p>Failed to load deposit info. Please try again.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Wrapper that handles mounting/unmounting to reset state
export function AddBonkSheet({ isOpen, onClose, onSuccess }: AddBonkSheetProps) {
    if (!isOpen) return null;

    // Content component remounts when sheet reopens, resetting all state
    return <AddBonkSheetContent onClose={onClose} onSuccess={onSuccess} />;
}