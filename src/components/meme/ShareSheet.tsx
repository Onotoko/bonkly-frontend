import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconLink from '@/assets/images/img-copy-link.png';
import iconWhatsapp from '@/assets/images/img-whatsapp.png';
import iconTelegram from '@/assets/images/img-telegram.png';
import iconX from '@/assets/images/img-x.png';
import iconSms from '@/assets/images/img-sms.png';

interface ShareSheetProps {
    isOpen: boolean;
    onClose: () => void;
    memeId: string;
    caption?: string;
}

export function ShareSheet({ isOpen, onClose, memeId, caption }: ShareSheetProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/meme/${memeId}`;
    const shareText = caption || 'Check out this meme on Bonkly!';

    // Native Web Share API (PWA)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Bonkly Meme',
                    text: shareText,
                    url: shareUrl,
                });
                onClose();
            } catch (err) {
                // User cancelled or error
                if ((err as Error).name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        }
    };

    // Copy link to clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Platform-specific share URLs
    const shareToPlatform = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareText);

        const urls: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            sms: `sms:?body=${encodedText}%20${encodedUrl}`,
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'noopener,noreferrer');
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Check if native share is supported
    const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    return (
        <div
            className={`sheet-overlay share-sheet ${isOpen ? 'open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="sheet">
                {/* Header */}
                <header className="sheet-header">
                    <h3 className="sheet-title">Send to</h3>
                    <button className="sheet-close" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>

                {/* Share options */}
                <div className="share-row">
                    Copy Link
                    <button className="share-chip" onClick={handleCopyLink}>
                        <div className="share-circle" style={{ background: '#f2f4f7' }}>
                            <img src={iconLink} alt="" style={{ width: 24, height: 24, margin: 'auto' }} />
                        </div>
                        <span className="share-label">{copied ? 'Copied!' : 'Copy link'}</span>
                    </button>

                    {/* WhatsApp */}
                    <button className="share-chip" onClick={() => shareToPlatform('whatsapp')}>
                        <div className="share-circle">
                            <img src={iconWhatsapp} alt="" />
                        </div>
                        <span className="share-label">WhatsApp</span>
                    </button>

                    {/* X (Twitter) */}
                    <button className="share-chip" onClick={() => shareToPlatform('x')}>
                        <div className="share-circle">
                            <img src={iconX} alt="" />
                        </div>
                        <span className="share-label">X</span>
                    </button>

                    {/* Telegram */}
                    <button className="share-chip" onClick={() => shareToPlatform('telegram')}>
                        <div className="share-circle">
                            <img src={iconTelegram} alt="" />
                        </div>
                        <span className="share-label">Telegram</span>
                    </button>

                    {/* SMS */}
                    <button className="share-chip" onClick={() => shareToPlatform('sms')}>
                        <div className="share-circle">
                            <img src={iconSms} alt="" />
                        </div>
                        <span className="share-label">SMS</span>
                    </button>
                </div>

                {/* Native Share Button (for PWA) */}
                {canNativeShare && (
                    <button className="native-share-btn" onClick={handleNativeShare}>
                        More options...
                    </button>
                )}

                {/* Cancel */}
                <button className="sheet-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}