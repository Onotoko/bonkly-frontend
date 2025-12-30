// Icons
import iconBack from '@/assets/icons/icon-back.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';

// Images
import ornament from '@/assets/images/ornament-1.png';

// Types
import type { PowerDownStatus } from '@/types/api';

interface LaughPowerSheetProps {
    isOpen: boolean;
    onClose: () => void;
    dBonkBalance: number;
    activePowerDown: PowerDownStatus | null;
    onPowerDown: () => void;
    onPowerUp: () => void;
}

export function LaughPowerSheet({
    isOpen,
    onClose,
    dBonkBalance,
    activePowerDown,
    onPowerDown,
    onPowerUp,
}: LaughPowerSheetProps) {
    if (!isOpen) return null;

    const formatBalance = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const hasActivePowerDown = activePowerDown && activePowerDown.status === 'active';
    const bonkRemaining = hasActivePowerDown
        ? activePowerDown.totalBonkEquivalent - activePowerDown.bonkDistributed
        : 0;

    return (
        <div className="earn-modal-overlay">
            <div className="earn-modal-fullscreen">
                <header className="laugh-power-header">
                    <button className="icon-button" onClick={onClose} aria-label="Back">
                        <img src={iconBack} alt="" />
                    </button>
                    <span className="earn-modal-title">Laugh Power</span>
                </header>

                <div className="laugh-power-body">
                    <div className="laugh-power-top">
                        <p className="laugh-power-headline">Your Laugh Power</p>
                        <div className="laugh-power-amount">
                            <img src={iconLaughWeight} alt="" />
                            {formatBalance(dBonkBalance)}
                        </div>

                        {/* Show active power down status banner */}
                        {hasActivePowerDown && (
                            <div className="laugh-power-status-banner">
                                <div className="status-banner-icon">
                                    <img src={iconBonk} alt="" />
                                </div>
                                <div className="status-banner-content">
                                    <span className="status-banner-title">Power Down Active</span>
                                    <span className="status-banner-sub">
                                        Week {activePowerDown.weeksCompleted + 1}/8 • Next:{' '}
                                        {formatDate(activePowerDown.nextPayoutDate)}
                                    </span>
                                </div>
                                <span className="status-banner-amount">
                                    +{formatBalance(bonkRemaining)} BONK
                                </span>
                            </div>
                        )}

                        <div className="laugh-power-actions">
                            <button className="laugh-power-btn down" onClick={onPowerDown}>
                                {hasActivePowerDown ? 'View Power Down' : 'Power Down'}
                            </button>
                            <button className="laugh-power-btn up" onClick={onPowerUp}>
                                Power Up
                            </button>
                        </div>
                    </div>

                    <div className="laugh-power-card">
                        <p className="laugh-power-card-title">
                            Your Laugh Power increases your influence.
                        </p>
                        <p>
                            When you Power Up, you lock BONK to boost your Laugh Power which is
                            dBonk.
                        </p>
                        <p>
                            When you Power Down, your locked dBONK slowly converts back into
                            withdrawable BONK over 8 weeks, which is added to your wallet.
                        </p>
                        {hasActivePowerDown && (
                            <p style={{ marginTop: '8px', color: '#f59e0b' }}>
                                <strong>Note:</strong> You have an active Power Down. You can view
                                progress or cancel it anytime.
                            </p>
                        )}
                    </div>

                    <div className="laugh-power-ornament">
                        <img src={ornament} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}