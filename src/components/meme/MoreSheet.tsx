// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconBookmark from '@/assets/icons/icon-bookmark-default.svg';
import iconFlag from '@/assets/icons/icon-flag-default.svg';

interface MoreSheetProps {
    isOpen: boolean;
    onClose: () => void;
    handle: string;
    onFavorite: () => void;
    onReport: () => void;
}

export function MoreSheet({ isOpen, onClose, handle, onFavorite, onReport }: MoreSheetProps) {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`sheet-overlay more-sheet ${isOpen ? 'open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="sheet">
                {/* Header */}
                <header className="sheet-header">
                    <h3 className="sheet-title">
                        More <span className="handle">{handle}</span>
                    </h3>
                    <button className="sheet-close" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>

                {/* Options */}
                <button className="more-item" onClick={onFavorite}>
                    <span className="more-icon">
                        <img src={iconBookmark} alt="" />
                    </span>
                    <span>Favorite</span>
                </button>
                <button className="more-item" onClick={onReport}>
                    <span className="more-icon">
                        <img src={iconFlag} alt="" />
                    </span>
                    <span>Report</span>
                </button>

                {/* Cancel */}
                <button className="sheet-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}