import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

interface WithdrawalRequest {
    withdrawalId: string;
    amount: number;
    destinationAddress: string;
    estimatedFee: number;
    feePaymentAddress: string;
    status: string;
    createdAt: string;
    failedAt?: string;
    completedAt?: string;
    metadata?: {
        failureReason?: string;
        autoRefunded?: boolean;
    };
}

interface PendingWithdrawalsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    withdrawals: WithdrawalRequest[];
    isLoading: boolean;
    onContinue: (withdrawal: WithdrawalRequest) => void;
    onCancel: (withdrawalId: string) => Promise<void>;
    isCancelling: boolean;
}

export function PendingWithdrawalsSheet({
    isOpen,
    onClose,
    withdrawals,
    isLoading,
    onContinue,
    onCancel,
    isCancelling,
}: PendingWithdrawalsSheetProps) {
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isCancelling) {
            onClose();
        }
    };

    const handleCancel = async (withdrawalId: string) => {
        setCancellingId(withdrawalId);
        try {
            await onCancel(withdrawalId);
        } finally {
            setCancellingId(null);
        }
    };

    const formatAmount = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateAddress = (addr: string) => {
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const getStatusBadge = (status: string, metadata?: WithdrawalRequest['metadata']) => {
        switch (status) {
            case 'awaiting_fee_payment':
                return <span className="withdrawal-status pending">Awaiting Fee</span>;
            case 'processing':
                return <span className="withdrawal-status processing">Processing</span>;
            case 'completed':
                return <span className="withdrawal-status completed">Completed</span>;
            case 'failed':
                if (metadata?.autoRefunded) {
                    return <span className="withdrawal-status refunded">Refunded</span>;
                }
                return <span className="withdrawal-status failed">Failed</span>;
            default:
                return <span className="withdrawal-status">{status}</span>;
        }
    };

    // Filter to show pending/processing/failed (not completed)
    const activeWithdrawals = withdrawals.filter(
        (w) => w.status !== 'completed'
    );

    return (
        <div className="earn-modal-overlay" onClick={handleOverlayClick}>
            <div className="earn-modal-sheet" style={{ maxHeight: '70vh' }}>
                <header className="earn-modal-header">
                    <span className="earn-modal-title">Pending Withdrawals</span>
                    <button
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isCancelling}
                    >
                        <img src={iconClose} alt="" />
                    </button>
                </header>

                <div className="pending-withdrawals-body">
                    {isLoading ? (
                        <div className="earn-loading">Loading...</div>
                    ) : activeWithdrawals.length === 0 ? (
                        <div className="earn-empty">
                            <p>No pending withdrawals</p>
                        </div>
                    ) : (
                        <div className="pending-withdrawals-list">
                            {activeWithdrawals.map((withdrawal) => (
                                <div key={withdrawal.withdrawalId} className="pending-withdrawal-item">
                                    <div className="pending-withdrawal-top">
                                        <div className="pending-withdrawal-amount">
                                            <img src={iconBonk} alt="" />
                                            <span>{formatAmount(withdrawal.amount)} BONK</span>
                                        </div>
                                        {getStatusBadge(withdrawal.status, withdrawal.metadata)}
                                    </div>

                                    <div className="pending-withdrawal-details">
                                        <div className="pending-withdrawal-row">
                                            <span className="label">To:</span>
                                            <span className="value mono">
                                                {truncateAddress(withdrawal.destinationAddress)}
                                            </span>
                                        </div>
                                        <div className="pending-withdrawal-row">
                                            <span className="label">Fee:</span>
                                            <span className="value">{withdrawal.estimatedFee.toFixed(6)} SOL</span>
                                        </div>
                                        <div className="pending-withdrawal-row">
                                            <span className="label">Created:</span>
                                            <span className="value">{formatDate(withdrawal.createdAt)}</span>
                                        </div>
                                    </div>

                                    {withdrawal.status === 'failed' && withdrawal.metadata?.failureReason && (
                                        <div className="pending-withdrawal-error">
                                            {withdrawal.metadata.failureReason}
                                        </div>
                                    )}

                                    <div className="pending-withdrawal-actions">
                                        {withdrawal.status === 'awaiting_fee_payment' && (
                                            <>
                                                <button
                                                    className="pending-btn secondary"
                                                    onClick={() => handleCancel(withdrawal.withdrawalId)}
                                                    disabled={cancellingId === withdrawal.withdrawalId}
                                                >
                                                    {cancellingId === withdrawal.withdrawalId
                                                        ? 'Cancelling...'
                                                        : 'Cancel & Refund'}
                                                </button>
                                                <button
                                                    className="pending-btn primary"
                                                    onClick={() => onContinue(withdrawal)}
                                                >
                                                    Continue
                                                </button>
                                            </>
                                        )}
                                        {withdrawal.status === 'processing' && (
                                            <span className="pending-status-text">
                                                Transfer in progress...
                                            </span>
                                        )}
                                        {withdrawal.status === 'failed' && withdrawal.metadata?.autoRefunded && (
                                            <span className="pending-status-text refunded">
                                                ✓ BONK has been refunded to your wallet
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}