import { useState, useMemo } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconCheck from '@/assets/icons/icon-profile-security.svg';

// Types from API
import type { PowerDownStatus } from '@/types/api';

// Constants - match backend
const BONK_TO_DBONK_RATE = 15;
const POWER_DOWN_WEEKS = 8;

interface PowerDownSheetProps {
    isOpen: boolean;
    onClose: () => void;
    dBonkBalance: number;
    activePowerDown: PowerDownStatus | null;
    onSubmit: (amount: number) => void;
    onCancel: () => void;
    isLoading?: boolean;
    isCancelling?: boolean;
}

export function PowerDownSheet({
    isOpen,
    onClose,
    dBonkBalance,
    activePowerDown,
    onSubmit,
    onCancel,
    isLoading = false,
    isCancelling = false,
}: PowerDownSheetProps) {
    const [amount, setAmount] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Calculate preview values for new power down
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

    // Generate schedule for active power down
    const schedule = useMemo(() => {
        if (!activePowerDown) return [];

        const weeks = [];
        const startDate = new Date(activePowerDown.startDate);
        const weeklyBonk = activePowerDown.weeklyBonkAmount;
        const completedWeeks = activePowerDown.weeksCompleted;

        for (let i = 1; i <= POWER_DOWN_WEEKS; i++) {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(scheduledDate.getDate() + i * 7);

            let status: 'completed' | 'processing' | 'pending' = 'pending';
            if (i <= completedWeeks) {
                status = 'completed';
            } else if (i === completedWeeks + 1) {
                status = 'processing';
            }

            weeks.push({
                week: i,
                bonkAmount: weeklyBonk,
                scheduledDate: scheduledDate.toISOString(),
                status,
            });
        }

        return weeks;
    }, [activePowerDown]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading && !isCancelling) {
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

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        onCancel();
        setShowCancelConfirm(false);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        if (num < 1 && num > 0) return num.toFixed(4);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount > 0 && numAmount <= dBonkBalance;

    // If there's an active power down, show status view
    if (activePowerDown && activePowerDown.status === 'active') {
        const progress = (activePowerDown.weeksCompleted / POWER_DOWN_WEEKS) * 100;
        const dbonkRemaining = activePowerDown.totalDBonkAmount - activePowerDown.dbonkConverted;
        const bonkRemaining = activePowerDown.totalBonkEquivalent - activePowerDown.bonkDistributed;

        return (
            <div className="earn-modal-overlay" onClick={handleOverlayClick}>
                <div className="earn-modal-sheet">
                    <header className="earn-modal-header">
                        <span className="earn-modal-title">Power Down Status</span>
                        <button
                            className="icon-button"
                            onClick={onClose}
                            aria-label="Close"
                            disabled={isCancelling}
                        >
                            <img src={iconClose} alt="" />
                        </button>
                    </header>

                    <div className="power-modal-body">
                        {/* Progress Section */}
                        <div className="power-down-status">
                            <div className="power-down-progress-header">
                                <span className="power-down-week">
                                    Week {activePowerDown.weeksCompleted + 1} of {POWER_DOWN_WEEKS}
                                </span>
                                <span className="power-down-percent">{Math.round(progress)}%</span>
                            </div>
                            <div className="power-down-progress-bar">
                                <div
                                    className="power-down-progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="power-preview">
                            <div className="power-preview-row">
                                <span>Total Amount</span>
                                <span className="power-preview-value">
                                    <img src={iconLaughWeight} alt="" />
                                    {formatNumber(activePowerDown.totalDBonkAmount)} dBONK
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>BONK Received</span>
                                <span className="power-preview-value" style={{ color: '#22c55e' }}>
                                    <img src={iconBonk} alt="" />
                                    +{formatNumber(activePowerDown.bonkDistributed)}
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>BONK Remaining</span>
                                <span className="power-preview-value">
                                    <img src={iconBonk} alt="" />
                                    {formatNumber(bonkRemaining)}
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>Weekly Payout</span>
                                <span className="power-preview-value">
                                    <img src={iconBonk} alt="" />
                                    ~{formatNumber(activePowerDown.weeklyBonkAmount)}
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>Next Distribution</span>
                                <span className="power-preview-value">
                                    {formatDate(activePowerDown.nextPayoutDate)}
                                </span>
                            </div>
                            <div className="power-preview-row">
                                <span>Completes On</span>
                                <span className="power-preview-value">
                                    {formatDate(activePowerDown.estimatedCompletion)}
                                </span>
                            </div>
                        </div>

                        {/* Schedule Timeline */}
                        <div className="power-down-schedule">
                            <p className="power-down-schedule-title">Distribution Schedule</p>
                            <div className="power-down-timeline">
                                {schedule.map((week) => (
                                    <div
                                        key={week.week}
                                        className={`power-down-timeline-item ${week.status}`}
                                    >
                                        <div className="timeline-marker">
                                            {week.status === 'completed' ? (
                                                <img src={iconCheck} alt="" />
                                            ) : (
                                                <span>{week.week}</span>
                                            )}
                                        </div>
                                        <div className="timeline-content">
                                            <span className="timeline-week">Week {week.week}</span>
                                            <span className="timeline-amount">
                                                {formatNumber(week.bonkAmount)} BONK
                                            </span>
                                        </div>
                                        <span className="timeline-date">
                                            {week.status === 'completed'
                                                ? 'Completed'
                                                : formatDate(week.scheduledDate)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cancel Confirmation */}
                        {showCancelConfirm ? (
                            <div className="power-down-cancel-confirm">
                                <p className="cancel-confirm-text">
                                    Are you sure you want to cancel? The{' '}
                                    <strong>{formatNumber(dbonkRemaining)} dBONK</strong>{' '}
                                    remaining will stay as Laugh Power. BONK already received is yours to keep.
                                </p>
                                <div className="cancel-confirm-actions">
                                    <button
                                        className="power-btn-secondary"
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={isCancelling}
                                    >
                                        Keep Power Down
                                    </button>
                                    <button
                                        className="power-btn-danger"
                                        onClick={handleConfirmCancel}
                                        disabled={isCancelling}
                                    >
                                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="power-cta power-cta-outline"
                                onClick={handleCancelClick}
                                disabled={isCancelling}
                            >
                                Cancel Power Down
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default: Show form to start new power down
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