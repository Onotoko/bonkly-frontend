// Icons
import iconBack from '@/assets/icons/icon-back.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

// Images
import ornament from '@/assets/images/ornament-1.png';

interface LaughPowerSheetProps {
    isOpen: boolean;
    onClose: () => void;
    dBonkBalance: number;
    onPowerDown: () => void;
    onPowerUp: () => void;
}

export function LaughPowerSheet({
    isOpen,
    onClose,
    dBonkBalance,
    onPowerDown,
    onPowerUp,
}: LaughPowerSheetProps) {
    if (!isOpen) return null;

    const formatBalance = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

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
                            <img src={iconBonk} alt="" />
                            {formatBalance(dBonkBalance)}
                        </div>
                        <div className="laugh-power-actions">
                            <button className="laugh-power-btn down" onClick={onPowerDown}>
                                Power Down
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
                    </div>

                    <div className="laugh-power-ornament">
                        <img src={ornament} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}