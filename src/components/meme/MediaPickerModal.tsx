import { useRef, useState, useCallback } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';

export interface SelectedMedia {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
}

interface RecentMedia {
    previewUrl: string;
    type: 'image' | 'video';
    name: string;
    lastUsed: number;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: (media: SelectedMedia) => void;
    isUploading?: boolean;
    uploadProgress?: number;
}

const RECENT_MEDIA_KEY = 'bonkly_recent_media';
const MAX_RECENT = 9;

// Load recent media from localStorage
const loadRecentMedia = (): RecentMedia[] => {
    try {
        const stored = localStorage.getItem(RECENT_MEDIA_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore errors
    }
    return [];
};

// Save recent media to localStorage
const saveRecentMedia = (media: RecentMedia[]) => {
    try {
        localStorage.setItem(RECENT_MEDIA_KEY, JSON.stringify(media.slice(0, MAX_RECENT)));
    } catch {
        // Ignore errors (quota exceeded, etc.)
    }
};

// Add media to recent list
const addToRecent = (file: File, previewUrl: string, type: 'image' | 'video') => {
    const recent = loadRecentMedia();

    // Remove if already exists
    const filtered = recent.filter(m => m.name !== file.name);

    // Add to beginning
    const newRecent: RecentMedia = {
        previewUrl,
        type,
        name: file.name,
        lastUsed: Date.now(),
    };

    saveRecentMedia([newRecent, ...filtered]);
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
    const [recentMedia, setRecentMedia] = useState<RecentMedia[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Handle file selection from device
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            setError('Please select image or video files only');
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File is too large. Maximum size is 50MB.');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const type = isVideo ? 'video' : 'image';

        // Set selected media
        setSelectedMedia({
            file,
            previewUrl,
            type,
        });

        // Add to recent
        addToRecent(file, previewUrl, type);
        setRecentMedia(loadRecentMedia());

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Handle select from device button
    const handleSelectFromDevice = () => {
        fileInputRef.current?.click();
    };

    // Handle click on selected media (to change it)
    const handleClickSelected = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    // Handle select from recent
    const handleSelectRecent = async (recent: RecentMedia) => {
        if (isUploading) return;

        try {
            // For recent items, we need to fetch the blob from the URL
            const response = await fetch(recent.previewUrl);
            const blob = await response.blob();
            const file = new File([blob], recent.name, { type: blob.type });

            setSelectedMedia({
                file,
                previewUrl: recent.previewUrl,
                type: recent.type,
            });
        } catch {
            // If blob URL expired, remove from recent
            const updated = recentMedia.filter(m => m.previewUrl !== recent.previewUrl);
            saveRecentMedia(updated);
            setRecentMedia(updated);
            setError('This image is no longer available. Please select again.');
        }
    };

    // Handle next button
    const handleNext = () => {
        if (selectedMedia) {
            onNext(selectedMedia);
        }
    };

    // Handle close
    const handleClose = () => {
        if (selectedMedia) {
            URL.revokeObjectURL(selectedMedia.previewUrl);
        }
        setSelectedMedia(null);
        setError(null);
        setHasInitialized(false);
        onClose();
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isUploading) {
            handleClose();
        }
    };

    // Initialize when overlay becomes visible (via onAnimationEnd or first interaction)
    const handleOverlayMount = useCallback(() => {
        if (!hasInitialized) {
            setRecentMedia(loadRecentMedia());
            setSelectedMedia(null);
            setError(null);
            setHasInitialized(true);
        }
    }, [hasInitialized]);

    if (!isOpen) return null;

    // Trigger initialization on first render when open
    if (!hasInitialized) {
        // Use setTimeout to defer state update
        setTimeout(handleOverlayMount, 0);
    }

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Modal overlay */}
            <div className="media-picker-overlay" onClick={handleBackdropClick}>
                <div className="media-picker-sheet">
                    {/* Header */}
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

                    {/* Toolbar */}
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

                    {/* Error message */}
                    {error && (
                        <div className="media-picker-error">
                            {error}
                        </div>
                    )}

                    {/* Upload progress */}
                    {isUploading && (
                        <div className="media-picker-progress">
                            <div
                                className="media-picker-progress-bar"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {/* Media Grid */}
                    <div className="media-picker-grid">
                        {/* Selected media - always first */}
                        {selectedMedia && (
                            <div
                                className="media-item selected"
                                onClick={handleClickSelected}
                                title="Tap to change"
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

                        {/* Recent media (excluding currently selected) */}
                        {recentMedia
                            .filter(m => m.previewUrl !== selectedMedia?.previewUrl)
                            .map((recent, index) => (
                                <div
                                    key={`recent-${index}-${recent.name}`}
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

                        {/* Empty state or add more button */}
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

                        {/* Add button when has recent but no selection */}
                        {!selectedMedia && recentMedia.length > 0 && (
                            <div
                                className="media-item add-more"
                                onClick={handleSelectFromDevice}
                            >
                                <span className="add-more-icon">+</span>
                            </div>
                        )}
                    </div>

                    {/* Helper text */}
                    <p className="media-picker-help">
                        {selectedMedia
                            ? 'Tap the image to change selection'
                            : 'Select an image or video from your device'
                        }
                    </p>
                </div>
            </div>
        </>
    );
}