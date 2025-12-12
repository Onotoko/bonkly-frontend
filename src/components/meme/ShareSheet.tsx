// Icons
import iconClose from '@/assets/icons/icon-close.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';
import imgCopyLink from '@/assets/images/img-copy-link.png';
import imgWhatsapp from '@/assets/images/img-whatsapp.png';
import imgX from '@/assets/images/img-x.png';
import imgTelegram from '@/assets/images/img-telegram.png';
import imgSms from '@/assets/images/img-sms.png';

interface ShareSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCopyLink: () => void;
    onShare: (platform: string) => void;
}

const CONTACTS = [
    { id: '1', name: 'Abraham', avatar: avatarDefault },
    { id: '2', name: 'Zaire', avatar: avatarDefault },
    { id: '3', name: 'Jaylon', avatar: avatarDefault },
    { id: '4', name: 'Kaylyn', avatar: avatarDefault },
    { id: '5', name: 'Carla', avatar: avatarDefault },
    { id: '6', name: 'Rayna', avatar: avatarDefault },
];

const PLATFORMS = [
    { id: 'copy', name: 'Copy link', icon: imgCopyLink },
    { id: 'whatsapp-status', name: 'Status', icon: imgWhatsapp },
    { id: 'x', name: 'X', icon: imgX },
    { id: 'telegram', name: 'Telegram', icon: imgTelegram },
    { id: 'sms', name: 'SMS', icon: imgSms },
    { id: 'whatsapp', name: 'WhatsApp', icon: imgWhatsapp },
];

export function ShareSheet({ isOpen, onClose, onCopyLink, onShare }: ShareSheetProps) {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handlePlatformClick = (platformId: string) => {
        if (platformId === 'copy') {
            onCopyLink();
        } else {
            onShare(platformId);
        }
    };

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

                {/* Contacts */}
                <div className="share-row">
                    {CONTACTS.map((contact) => (
                        <button key={contact.id} className="share-chip">
                            <div className="share-avatar">
                                <img src={contact.avatar} alt="" />
                            </div>
                            <span className="share-label">{contact.name}</span>
                        </button>
                    ))}
                </div>

                {/* Platforms */}
                <div className="share-row">
                    {PLATFORMS.map((platform) => (
                        <button
                            key={platform.id}
                            className="share-chip"
                            onClick={() => handlePlatformClick(platform.id)}
                        >
                            <div className="share-circle">
                                <img src={platform.icon} alt="" />
                            </div>
                            <span className="share-label">{platform.name}</span>
                        </button>
                    ))}
                </div>

                {/* Cancel */}
                <button className="sheet-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}