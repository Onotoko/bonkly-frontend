// Illustrations - combined images
import resultSuccess from '@/assets/illustrations/result-success.png';
import resultError from '@/assets/illustrations/result-error.png';

type ResultType = 'success' | 'error';

interface ResultModalProps {
    isOpen: boolean;
    type: ResultType;
    title: string;
    message: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
}

export function ResultModal({
    isOpen,
    type,
    title,
    message,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
}: ResultModalProps) {
    const illustration = type === 'success' ? resultSuccess : resultError;

    return (
        <div className={`result-modal ${isOpen ? 'open' : ''}`}>
            {/* Artwork */}
            <img src={illustration} alt="" className="result-artwork" />

            {/* Content */}
            <h2 className="result-title">{title}</h2>
            <p className="result-message">{message}</p>

            {/* Actions */}
            <div className="result-actions">
                {secondaryLabel && onSecondary && (
                    <button className="result-btn result-btn-secondary" onClick={onSecondary}>
                        {secondaryLabel}
                    </button>
                )}
                <button className="result-btn result-btn-primary" onClick={onPrimary}>
                    {primaryLabel}
                </button>
            </div>
        </div>
    );
}