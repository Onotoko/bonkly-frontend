import { useState, useCallback, useMemo } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconPaste from '@/assets/icons/icon-paste.svg';
import iconCopy from '@/assets/icons/icon-copy.svg';
import iconCheck from '@/assets/icons/icon-profile-security.svg';

type WithdrawStep = 'enter' | 'confirm' | 'processing';

interface WithdrawRequestData {
    withdrawalId: string;
    amount: number;
    estimatedFee: number;
    feePaymentAddress: string;
}

interface InitialWithdrawal {
    withdrawalId: string;
    amount: number;
    destinationAddress: string;
    estimatedFee: number;
    feePaymentAddress: string;
    status: string;
}

interface WithdrawSheetProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onRequestWithdraw: (amount: number, address: string) => Promise<WithdrawRequestData>;
    onConfirmWithdraw: (withdrawalId: string, feePaymentTxHash: string) => Promise<void>;
    onCancelWithdraw: (withdrawalId: string) => Promise<void>;
    isRequesting?: boolean;
    isConfirming?: boolean;
    initialWithdrawal?: InitialWithdrawal | null;
}

const MIN_WITHDRAWAL = 100;

export function WithdrawSheet({
    isOpen,
    onClose,
    balance,
    onRequestWithdraw,
    onConfirmWithdraw,
    onCancelWithdraw,
    isRequesting = false,
    isConfirming = false,
    initialWithdrawal = null,
}: WithdrawSheetProps) {
    // Internal step (only used when NOT continuing from initial)
    const [internalStep, setInternalStep] = useState<WithdrawStep>('enter');

    // Step 1: Enter amount & address
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [requestError, setRequestError] = useState('');

    // Step 2: Created withdrawal data (from request)
    const [createdWithdrawal, setCreatedWithdrawal] = useState<WithdrawRequestData | null>(null);
    const [solTxHash, setSolTxHash] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [copied, setCopied] = useState(false);

    // Derive actual step and withdrawal data based on initialWithdrawal
    const hasInitialWithdrawal = initialWithdrawal?.status === 'awaiting_fee_payment';

    const step: WithdrawStep = useMemo(() => {
        if (hasInitialWithdrawal && !createdWithdrawal && internalStep === 'enter') {
            return 'confirm';
        }
        return internalStep;
    }, [hasInitialWithdrawal, createdWithdrawal, internalStep]);

    const withdrawalData: WithdrawRequestData | null = useMemo(() => {
        if (createdWithdrawal) {
            return createdWithdrawal;
        }
        if (hasInitialWithdrawal && initialWithdrawal) {
            return {
                withdrawalId: initialWithdrawal.withdrawalId,
                amount: initialWithdrawal.amount,
                estimatedFee: initialWithdrawal.estimatedFee,
                feePaymentAddress: initialWithdrawal.feePaymentAddress,
            };
        }
        return null;
    }, [createdWithdrawal, hasInitialWithdrawal, initialWithdrawal]);

    // Reset all state
    const resetState = useCallback(() => {
        setInternalStep('enter');
        setAmount('');
        setAddress('');
        setRequestError('');
        setCreatedWithdrawal(null);
        setSolTxHash('');
        setConfirmError('');
        setCopied(false);
    }, []);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isRequesting && !isConfirming) {
            handleClose();
        }
    };

    const handleClose = async () => {
        // If in confirm step with NEW withdrawal (not from initialWithdrawal), ask to cancel
        if (step === 'confirm' && createdWithdrawal) {
            const shouldCancel = window.confirm(
                'You have a pending withdrawal. Cancelling will refund your BONK. Continue?'
            );
            if (shouldCancel) {
                try {
                    await onCancelWithdraw(createdWithdrawal.withdrawalId);
                    resetState();
                } catch (err) {
                    console.error('Failed to cancel withdrawal:', err);
                    return;
                }
            } else {
                return;
            }
        }
        resetState();
        onClose();
    };

    const handlePasteAddress = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setAddress(text.trim());
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    const handlePasteTxHash = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setSolTxHash(text.trim());
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    const handleCopyFeeAddress = async () => {
        if (!withdrawalData) return;
        try {
            await navigator.clipboard.writeText(withdrawalData.feePaymentAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Step 1: Request withdrawal
    const handleRequestWithdraw = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < MIN_WITHDRAWAL) {
            setRequestError(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} BONK`);
            return;
        }
        if (numAmount > balance) {
            setRequestError('Insufficient balance');
            return;
        }
        if (!address.trim() || address.trim().length < 32) {
            setRequestError('Please enter a valid Solana address');
            return;
        }

        setRequestError('');

        try {
            const data = await onRequestWithdraw(numAmount, address.trim());
            setCreatedWithdrawal(data);
            setInternalStep('confirm');
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            const msg = errorObj.message || 'Request failed. Please try again.';
            setRequestError(msg);
        }
    };

    // Step 2: Confirm with SOL payment
    const handleConfirmWithdraw = async () => {
        if (!withdrawalData) return;
        if (!solTxHash.trim() || solTxHash.trim().length < 64) {
            setConfirmError('Please enter a valid transaction hash');
            return;
        }

        setConfirmError('');

        try {
            await onConfirmWithdraw(withdrawalData.withdrawalId, solTxHash.trim());
            setInternalStep('processing');
        } catch (err: unknown) {
            // API throws ApiError object with { message, statusCode }
            const errorObj = err as { message?: string; statusCode?: number };
            const msg = errorObj.message || 'Confirmation failed. Please try again.';
            setConfirmError(msg);
        }
    };

    // Cancel and go back
    const handleCancelAndGoBack = async () => {
        if (!withdrawalData) return;

        try {
            await onCancelWithdraw(withdrawalData.withdrawalId);
            resetState();
            // If was continuing from initial, close the sheet
            if (hasInitialWithdrawal) {
                onClose();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Cancel failed. Please try again.';
            setConfirmError(msg);
        }
    };

    const handleDone = () => {
        resetState();
        onClose();
    };

    const formatBalance = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const numAmount = parseFloat(amount) || 0;
    const isStep1Valid = numAmount >= MIN_WITHDRAWAL && numAmount <= balance && address.trim().length >= 32;
    const isStep2Valid = solTxHash.trim().length >= 64;

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet">
                {/* Header */}
                <header className="earn-modal-header">
                    <span className="earn-modal-title">
                        {step === 'enter' && 'Withdraw BONK'}
                        {step === 'confirm' && 'Pay Network Fee'}
                        {step === 'processing' && 'Processing'}
                    </span>
                    <button
                        className="icon-button"
                        onClick={handleClose}
                        aria-label="Close"
                        disabled={isRequesting || isConfirming}
                    >
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                {/* Step 1: Enter Amount & Address */}
                {step === 'enter' && (
                    <div className="withdraw-modal-body">
                        <div className="withdraw-balance">
                            Balance:{' '}
                            <span className="power-badge red">
                                <img src={iconBonk} alt="" />
                                {formatBalance(balance)}
                            </span>
                        </div>

                        <div className="withdraw-fields">
                            <input
                                type="number"
                                className="withdraw-input"
                                placeholder={`Enter amount (min ${MIN_WITHDRAWAL.toLocaleString()} BONK)...`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isRequesting}
                            />

                            <div className="withdraw-address-row">
                                <input
                                    type="text"
                                    className="withdraw-input"
                                    placeholder="Paste your SOL address here..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={isRequesting}
                                />
                                <button
                                    className="withdraw-paste-btn"
                                    onClick={handlePasteAddress}
                                    disabled={isRequesting}
                                >
                                    <img src={iconPaste} alt="" />
                                    Paste
                                </button>
                            </div>

                            {requestError && (
                                <p className="withdraw-error">{requestError}</p>
                            )}

                            <div className="withdraw-note">
                                <span>Minimum: {MIN_WITHDRAWAL.toLocaleString()} BONK</span>
                                <span>Network fee required (SOL)</span>
                            </div>
                        </div>

                        <button
                            className="withdraw-cta"
                            onClick={handleRequestWithdraw}
                            disabled={!isStep1Valid || isRequesting}
                        >
                            {isRequesting ? 'Processing...' : 'Continue'}
                        </button>
                    </div>
                )}

                {/* Step 2: Pay SOL Fee & Confirm */}
                {step === 'confirm' && withdrawalData && (
                    <div className="withdraw-modal-body withdraw-confirm-body">
                        <div className="withdraw-summary">
                            <div className="withdraw-summary-row">
                                <span>Withdrawing</span>
                                <span className="withdraw-summary-value">
                                    <img src={iconBonk} alt="" />
                                    {withdrawalData.amount.toLocaleString()} BONK
                                </span>
                            </div>
                            <div className="withdraw-summary-row">
                                <span>Network Fee</span>
                                <span className="withdraw-summary-value highlight">
                                    {withdrawalData.estimatedFee.toFixed(6)} SOL
                                </span>
                            </div>
                        </div>

                        <div className="withdraw-fee-instructions">
                            <p className="withdraw-fee-title">Step 1: Send SOL fee to this address</p>
                            <div className="withdraw-fee-address">
                                <span className="withdraw-fee-address-text">
                                    {withdrawalData.feePaymentAddress}
                                </span>
                                <button
                                    className="withdraw-copy-btn"
                                    onClick={handleCopyFeeAddress}
                                >
                                    <img src={copied ? iconCheck : iconCopy} alt="" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <p className="withdraw-fee-title" style={{ marginTop: 16 }}>
                                Step 2: Paste the transaction hash
                            </p>
                            <div className="withdraw-address-row">
                                <input
                                    type="text"
                                    className="withdraw-input"
                                    placeholder="Paste SOL payment tx hash..."
                                    value={solTxHash}
                                    onChange={(e) => setSolTxHash(e.target.value)}
                                    disabled={isConfirming}
                                />
                                <button
                                    className="withdraw-paste-btn"
                                    onClick={handlePasteTxHash}
                                    disabled={isConfirming}
                                >
                                    <img src={iconPaste} alt="" />
                                    Paste
                                </button>
                            </div>

                            {confirmError && (
                                <p className="withdraw-error">{confirmError}</p>
                            )}
                        </div>

                        <div className="withdraw-actions-row">
                            <button
                                className="withdraw-btn-secondary"
                                onClick={handleCancelAndGoBack}
                                disabled={isConfirming}
                            >
                                Cancel & Refund
                            </button>
                            <button
                                className="withdraw-cta"
                                onClick={handleConfirmWithdraw}
                                disabled={!isStep2Valid || isConfirming}
                            >
                                {isConfirming ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing */}
                {step === 'processing' && (
                    <div className="withdraw-modal-body withdraw-processing">
                        <div className="withdraw-processing-icon">
                            <div className="withdraw-spinner" />
                        </div>
                        <h3 className="withdraw-processing-title">Withdrawal Processing</h3>
                        <p className="withdraw-processing-text">
                            Your BONK is being sent to your wallet. This may take a few minutes.
                            You can close this window.
                        </p>
                        <button className="withdraw-cta" onClick={handleDone}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}