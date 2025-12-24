import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useUploadMedia } from '@/hooks/queries';
import { ResultModal } from '@/components/ui';
import { MediaPickerModal, SelectedMedia } from './MediaPickerModal';

// Icons
import iconMemeImage from '@/assets/icons/icon-meme-image.svg';
import iconMemeAI from '@/assets/icons/icon-meme-ai.svg';

// Images
import ornament from '@/assets/images/ornament-1.png';

interface CreateMemeSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateMemeSheet({ isOpen, onClose }: CreateMemeSheetProps) {
    const navigate = useNavigate();
    const uploadMutation = useUploadMedia();

    // Media picker modal state
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // Error modal state
    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    // Store media for retry
    const [pendingMedia, setPendingMedia] = useState<SelectedMedia | null>(null);

    // Handle upload option - open media picker
    const handleChooseUpload = () => {
        setShowMediaPicker(true);
    };

    // Handle media selected from picker
    const handleMediaSelected = useCallback(async (media: SelectedMedia) => {
        setPendingMedia(media);

        try {
            const result = await uploadMutation.mutateAsync(media.file);

            // Close both modals
            setShowMediaPicker(false);
            onClose();
            setPendingMedia(null);

            // Navigate to create meme page with uploaded media
            navigate(ROUTES.CREATE_MEME, {
                state: {
                    flow: 'upload',
                    mediaUrl: result.mediaUrl,
                    mediaType: media.type,
                    previewUrl: media.previewUrl,
                }
            });
        } catch {
            // Close media picker
            setShowMediaPicker(false);
            onClose();

            // Show error modal
            setErrorModal({
                isOpen: true,
                title: "Oops... That Didn't Work",
                message: 'The blockchain said "nah." Might just be a hiccup, try again.',
            });
        }
    }, [navigate, onClose, uploadMutation]);

    // Handle media picker close
    const handleMediaPickerClose = () => {
        setShowMediaPicker(false);
    };

    // Handle AI option
    const handleChooseAI = () => {
        onClose();
        navigate(ROUTES.CREATE_MEME, {
            state: { flow: 'ai' }
        });
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle error modal close
    const handleErrorClose = () => {
        setErrorModal(prev => ({ ...prev, isOpen: false }));
        setPendingMedia(null);
    };

    // Handle retry
    const handleRetry = () => {
        setErrorModal(prev => ({ ...prev, isOpen: false }));

        if (pendingMedia) {
            handleMediaSelected(pendingMedia);
        } else {
            // Re-open media picker
            setShowMediaPicker(true);
        }
    };

    // Don't render if nothing is open
    if (!isOpen && !showMediaPicker && !errorModal.isOpen) return null;

    return (
        <>
            {/* Main Sheet - How do you want to meme */}
            {isOpen && !showMediaPicker && (
                <div
                    className="create-meme-sheet-overlay open"
                    onClick={handleBackdropClick}
                >
                    <div className="create-meme-sheet">
                        {/* Ornament */}
                        <div className="meme-ornament">
                            <img src={ornament} alt="" />
                        </div>

                        {/* Header */}
                        <header className="meme-sheet-header">
                            <h3>How do you want to meme today?</h3>
                        </header>

                        {/* Options */}
                        <div className="meme-option-group">
                            <button
                                className="meme-option"
                                onClick={handleChooseUpload}
                                disabled={uploadMutation.isPending}
                            >
                                <span className="meme-icon">
                                    <img src={iconMemeImage} alt="" />
                                </span>
                                <span className="meme-copy">
                                    <span className="meme-title">Upload Image or Video</span>
                                    <span className="meme-sub">Free. Instant. No credits needed.</span>
                                </span>
                            </button>

                            <button
                                className="meme-option"
                                onClick={handleChooseAI}
                                disabled={uploadMutation.isPending}
                            >
                                <span className="meme-icon ai">
                                    <img src={iconMemeAI} alt="" />
                                </span>
                                <span className="meme-copy">
                                    <span className="meme-title">Generate with AI</span>
                                    <span className="meme-sub">Costs Credits (powered by BONK)</span>
                                </span>
                            </button>
                        </div>

                        {/* Cancel button */}
                        <button
                            className="meme-cancel"
                            onClick={onClose}
                            disabled={uploadMutation.isPending}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={handleMediaPickerClose}
                onNext={handleMediaSelected}
                isUploading={uploadMutation.isPending}
                uploadProgress={uploadMutation.progress}
            />

            {/* Error Modal */}
            <ResultModal
                isOpen={errorModal.isOpen}
                type="error"
                title={errorModal.title}
                message={errorModal.message}
                primaryLabel="Retry"
                secondaryLabel="Close"
                onPrimary={handleRetry}
                onSecondary={handleErrorClose}
            />
        </>
    );
}