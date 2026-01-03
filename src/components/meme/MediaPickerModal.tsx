import { useRef, useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';

export interface SelectedMedia {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
}

interface RecentMedia {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    name: string;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: (media: SelectedMedia) => void;
    isUploading?: boolean;
    uploadProgress?: number;
}

// Session-only recent media store
const recentMediaStore: RecentMedia[] = [];
const MAX_RECENT = 9;

// Clear invalid localStorage on module load
const RECENT_MEDIA_KEY = 'bonkly_recent_media';
try {
    localStorage.removeItem(RECENT_MEDIA_KEY);
} catch {
    // Ignore
}

const addToRecent = (file: File, previewUrl: string, type: 'image' | 'video') => {
    const existingIndex = recentMediaStore.findIndex(
        m => m.name === file.name && m.file.size === file.size
    );
    if (existingIndex !== -1) {
        URL.revokeObjectURL(recentMediaStore[existingIndex].previewUrl);
        recentMediaStore.splice(existingIndex, 1);
    }

    recentMediaStore.unshift({ file, previewUrl, type, name: file.name });

    while (recentMediaStore.length > MAX_RECENT) {
        const removed = recentMediaStore.pop();
        if (removed) {
            URL.revokeObjectURL(removed.previewUrl);
        }
    }
};

export function MediaPickerModal({
    isOpen,
    onClose,
    onNext,
    isUploading = false,
    uploadProgress = 0,
}: MediaPickerModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Counter to force re-render when recent changes
    const [, setUpdateCounter] = useState(0);

    // Derive recent media from store (read during render is fine, just not refs)
    const recentMedia = [...recentMediaStore];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            setError('Please select image or video files only');
            return;
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File is too large. Maximum size is 50MB.');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const type = isVideo ? 'video' : 'image';

        addToRecent(file, previewUrl, type);
        setSelectedMedia({ file, previewUrl, type });
        // Force re-render to show updated recent
        setUpdateCounter(c => c + 1);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSelectFromDevice = () => {
        fileInputRef.current?.click();
    };

    const handleClickSelected = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleSelectRecent = (recent: RecentMedia) => {
        if (isUploading) return;
        setSelectedMedia({
            file: recent.file,
            previewUrl: recent.previewUrl,
            type: recent.type,
        });
    };

    const handleNext = () => {
        if (selectedMedia) {
            onNext(selectedMedia);
        }
    };

    const handleClose = () => {
        setSelectedMedia(null);
        setError(null);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isUploading) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <div className="media-picker-overlay" onClick={handleBackdropClick}>
                <div className="media-picker-sheet">
                    <header className="media-picker-header">
                        <h3 className="media-picker-title">Upload Media</h3>
                        <button
                            className="icon-button"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            <img src={iconClose} alt="Close" />
                        </button>
                    </header>

                    <div className="media-picker-toolbar">
                        <button
                            className="media-filter-btn"
                            onClick={handleSelectFromDevice}
                            disabled={isUploading}
                        >
                            Recent ▾
                        </button>
                        <button
                            className="media-next-btn"
                            onClick={handleNext}
                            disabled={!selectedMedia || isUploading}
                        >
                            {isUploading ? `${uploadProgress}%` : 'Next'}
                        </button>
                    </div>

                    {error && (
                        <div className="media-picker-error">{error}</div>
                    )}

                    {isUploading && (
                        <div className="media-picker-progress">
                            <div
                                className="media-picker-progress-bar"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    <div className="media-picker-grid">
                        {selectedMedia && (
                            <div
                                className="media-item selected"
                                onClick={handleClickSelected}
                            >
                                {selectedMedia.type === 'video' ? (
                                    <video src={selectedMedia.previewUrl} />
                                ) : (
                                    <img src={selectedMedia.previewUrl} alt="" />
                                )}
                                <span className="media-check">✓</span>
                                <span className="media-change-hint">Tap to change</span>
                            </div>
                        )}

                        {recentMedia
                            .filter(m => m.previewUrl !== selectedMedia?.previewUrl)
                            .map((recent, index) => (
                                <div
                                    key={`recent-${recent.name}-${index}`}
                                    className="media-item recent"
                                    onClick={() => handleSelectRecent(recent)}
                                >
                                    {recent.type === 'video' ? (
                                        <video src={recent.previewUrl} />
                                    ) : (
                                        <img src={recent.previewUrl} alt="" />
                                    )}
                                </div>
                            ))}

                        {!selectedMedia && recentMedia.length === 0 && (
                            <div
                                className="media-item add-media"
                                onClick={handleSelectFromDevice}
                            >
                                <div className="add-media-content">
                                    <span className="add-media-icon">+</span>
                                    <span className="add-media-text">
                                        Tap to select from device
                                    </span>
                                </div>
                            </div>
                        )}

                        {(selectedMedia || recentMedia.length > 0) && (
                            <div
                                className="media-item add-more"
                                onClick={handleSelectFromDevice}
                            >
                                <span className="add-more-icon">+</span>
                            </div>
                        )}
                    </div>

                    <p className="media-picker-help">
                        {selectedMedia
                            ? 'Tap the image to change selection'
                            : recentMedia.length > 0
                                ? 'Select from recent or add new'
                                : 'Select an image or video from your device'
                        }
                    </p>
                </div>
            </div>
        </>
    );
}