import { useState } from 'react';
import { useBalances } from '@/hooks/queries';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';

interface LaughSheetProps {
    isOpen: boolean;
    onClose: () => void;
    handle: string;
    onSubmit: (sliderPercentage: number) => void;
}

const LAUGH_OPTIONS = [
    { emoji: '😂', label: 'Chuckle', percent: '1%', value: 1 },
    { emoji: '🤣', label: 'Dying', percent: '50%', value: 50 },
    { emoji: '💀', label: "Can't breathe", percent: '100%', value: 100 },
];

export function LaughSheet({ isOpen, onClose, handle, onSubmit }: LaughSheetProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [sliderValue, setSliderValue] = useState(1);

    // Get user balance
    const { data: balances } = useBalances();
    const laughWeight = balances?.laughWeight ?? 0;

    const bonkAmount = Math.round((sliderValue / 100) * laughWeight * 10) / 10;
    const canSubmit = bonkAmount > 0 && laughWeight > 0;

    const handleClose = () => {
        setSelectedIndex(0);
        setSliderValue(1);
        onClose();
    };

    const handleChipClick = (index: number) => {
        setSelectedIndex(index);
        setSliderValue(LAUGH_OPTIONS[index].value);
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setSliderValue(val);

        if (val <= 25) setSelectedIndex(0);
        else if (val <= 75) setSelectedIndex(1);
        else setSelectedIndex(2);
    };

    const handleSubmit = () => {
        if (canSubmit) {
            onSubmit(sliderValue);
            handleClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className={`sheet-overlay laugh-sheet ${isOpen ? 'open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="sheet">
                <header className="sheet-header">
                    <h3 className="sheet-title">
                        Send a Laugh <span className="handle">{handle}</span>
                    </h3>
                    <button className="sheet-close" onClick={handleClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>

                <div className="laugh-weight">
                    <span className="label">Laugh Weight:</span>
                    <span className="laugh-weight-badge">
                        <img src={iconLaughWeight} alt="" />
                        {laughWeight.toFixed(1)}
                    </span>
                </div>

                <div className="laugh-options">
                    {LAUGH_OPTIONS.map((option, index) => (
                        <button
                            key={option.label}
                            className={`laugh-chip ${selectedIndex === index ? 'active' : ''}`}
                            onClick={() => handleChipClick(index)}
                        >
                            <span className="emoji">{option.emoji}</span>
                            <span className="chip-label">{option.label}</span>
                            <span className="chip-percent">{option.percent}</span>
                        </button>
                    ))}
                </div>

                <div className="laugh-slider">
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={sliderValue}
                        onChange={handleSliderChange}
                    />
                </div>

                <button
                    className="laugh-cta"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    Laugh <img src={iconBonk} alt="" /> {bonkAmount} Bonk
                </button>
            </div>
        </div>
    );
}