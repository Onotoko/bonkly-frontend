import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Components
import { MediaPickerModal, SelectedMedia } from '@/components/meme/MediaPickerModal';

// Hooks
import {
    useGenerateAI,
    useCreditBalance,
    useCreditPackages,
    usePurchaseCredits,
    useCreateMeme,
} from '@/hooks/queries';

// Services
import { uploadService } from '@/services';

// Icons
import iconBack from '@/assets/icons/icon-back.svg';
import iconClose from '@/assets/icons/icon-close.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconPowerUp from '@/assets/icons/icon-power-up.svg';

// Images
import ornament from '@/assets/images/ornament-1.png';
import aiLaughFace from '@/assets/icons/icon-meme-ai-laugh.png';
import successIllustration from '@/assets/illustrations/result-success.png';
import failIllustration from '@/assets/illustrations/result-error.png';

// Types
type Step = 'ai-prompt' | 'ai-result' | 'post-form';
type MediaType = 'image' | 'video' | 'gif';
type Visibility = 'public' | 'private';
type AITemplate = 'image' | 'video';

interface LocationState {
    flow: 'upload' | 'ai';
    mediaUrl?: string;
    mediaType?: MediaType;
    previewUrl?: string;
}

interface PostFormData {
    caption: string;
    tags: string[];
    visibility: Visibility;
}

const MAX_CAPTION = 140;
const MAX_TAGS = 5;

const AI_COSTS: Record<AITemplate, number> = {
    image: 10,
    video: 50,
};

export function CreateMemePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;

    const getInitialStep = (): Step => {
        if (state?.flow === 'upload' && state.mediaUrl) {
            return 'post-form';
        }
        return 'ai-prompt';
    };

    // Step state
    const [step, setStep] = useState<Step>(getInitialStep);
    const [isAIFlow, setIsAIFlow] = useState(state?.flow === 'ai');

    // Media state
    const [mediaUrl, setMediaUrl] = useState<string>(state?.mediaUrl || '');
    const [mediaType, setMediaType] = useState<MediaType>(state?.mediaType || 'image');
    const [previewUrl, setPreviewUrl] = useState<string>(state?.previewUrl || '');

    // AI state
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTemplate, setAiTemplate] = useState<AITemplate>('image');
    const [aiReferenceMedia, setAiReferenceMedia] = useState<SelectedMedia | null>(null);
    const [isUploadingReference, setIsUploadingReference] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Post form state
    const [formData, setFormData] = useState<PostFormData>({
        caption: '',
        tags: [],
        visibility: 'public',
    });
    const [tagInput, setTagInput] = useState('');

    // Power Up Modal state
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

    // Modals
    const [showPowerUpModal, setShowPowerUpModal] = useState(false);
    const [showVisibilitySheet, setShowVisibilitySheet] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showAIMediaPicker, setShowAIMediaPicker] = useState(false);
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // Queries & Mutations
    const { data: creditData } = useCreditBalance();
    const { data: packagesData } = useCreditPackages();

    const aiMutation = useGenerateAI();
    const createMemeMutation = useCreateMeme();
    const purchaseMutation = usePurchaseCredits();

    const credits = creditData?.credits ?? 0;
    const bonkBalance = creditData?.bonkWalletBalance ?? 0;

    // Redirect if no valid state
    useEffect(() => {
        if (!state) {
            navigate(ROUTES.HOME);
        }
    }, [state, navigate]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (aiReferenceMedia?.previewUrl) {
                URL.revokeObjectURL(aiReferenceMedia.previewUrl);
            }
        };
    }, [aiReferenceMedia?.previewUrl]);

    // Handlers
    const handleBack = () => {
        if (step === 'ai-prompt') {
            navigate(ROUTES.HOME);
        } else if (step === 'ai-result') {
            setStep('ai-prompt');
        } else if (step === 'post-form') {
            if (isAIFlow) {
                setStep('ai-result');
            } else {
                navigate(ROUTES.HOME);
            }
        }
    };

    const handleClose = () => {
        if (mediaUrl || aiPrompt || formData.caption) {
            setShowDiscardModal(true);
        } else {
            navigate(ROUTES.HOME);
        }
    };

    const handleDiscard = () => {
        setShowDiscardModal(false);
        navigate(ROUTES.HOME);
    };

    // ============ AI Flow ============
    const handleAddReferenceMedia = () => {
        setShowAIMediaPicker(true);
    };

    const handleAIMediaSelected = (media: SelectedMedia) => {
        setAiReferenceMedia(media);
        setShowAIMediaPicker(false);
    };

    const handleRemoveReferenceMedia = () => {
        if (aiReferenceMedia) {
            URL.revokeObjectURL(aiReferenceMedia.previewUrl);
        }
        setAiReferenceMedia(null);
    };

    const handleCookMeme = async () => {
        if (!aiPrompt.trim()) return;

        const requiredCredits = AI_COSTS[aiTemplate];
        if (credits < requiredCredits) {
            setShowPowerUpModal(true);
            return;
        }

        try {
            let referenceMediaUrl: string | undefined;

            // Upload reference media first if exists
            if (aiReferenceMedia?.file) {
                setIsUploadingReference(true);
                setUploadProgress(0);

                try {
                    const uploadResult = await uploadService.uploadMedia(
                        aiReferenceMedia.file,
                        (percent) => setUploadProgress(percent)
                    );
                    referenceMediaUrl = uploadResult.mediaUrl;
                } catch (uploadError) {
                    console.error('Failed to upload reference media:', uploadError);
                    setResultModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Upload Failed',
                        message: 'Failed to upload reference media. Please try again.',
                    });
                    return;
                } finally {
                    setIsUploadingReference(false);
                    setUploadProgress(0);
                }
            }

            // Call AI generate with optional reference URL
            const result = await aiMutation.mutateAsync({
                prompt: aiPrompt,
                mediaType: aiTemplate === 'video' ? 'video' : 'image',
                duration: aiTemplate === 'video' ? 10 : undefined,
                referenceMediaUrl, // Pass the uploaded URL
            });

            setMediaUrl(result.url);
            setMediaType(aiTemplate === 'video' ? 'video' : 'image');
            setPreviewUrl(result.url);
            setIsAIFlow(true);
            setStep('ai-result');
        } catch {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: "Oops... That Didn't Work",
                message: 'The blockchain said "nah." Might just be a hiccup, try again.',
            });
        }
    };

    const handleNextFromResult = () => {
        setStep('post-form');
    };

    // ============ Power Up Modal ============
    const handleSelectPackage = (packageId: string) => {
        setSelectedPackageId(packageId);
    };

    const handlePowerUpClick = async () => {
        if (!selectedPackageId) return;

        const selectedPkg = packagesData?.find(pkg => pkg.packageId === selectedPackageId);
        if (!selectedPkg) return;

        const requiredBonk = selectedPkg.bonkCost ?? 0;

        if (bonkBalance < requiredBonk) {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: 'Insufficient BONK Balance',
                message: `You need ${requiredBonk.toLocaleString()} BONK but only have ${bonkBalance.toLocaleString()} BONK. Please add more BONK to your wallet.`,
            });
            return;
        }

        try {
            await purchaseMutation.mutateAsync({ packageId: selectedPackageId });
            setShowPowerUpModal(false);
            setSelectedPackageId(null);
            setResultModal({
                isOpen: true,
                type: 'success',
                title: 'Juiced Up!',
                message: 'Your Credits have arrived. Go generate some chaos.',
            });
        } catch {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: "Oops... That Didn't Work",
                message: 'Failed to purchase credits. Please try again.',
            });
        }
    };

    // ============ Post Form ============
    const handleCaptionChange = (value: string) => {
        if (value.length <= MAX_CAPTION) {
            setFormData(prev => ({ ...prev, caption: value }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().replace(/^#/, '');
        if (tag && formData.tags.length < MAX_TAGS && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleVisibilitySelect = (visibility: Visibility) => {
        setFormData(prev => ({ ...prev, visibility }));
        setShowVisibilitySheet(false);
    };

    const handlePostMeme = async () => {
        if (!mediaUrl) return;

        try {
            await createMemeMutation.mutateAsync({
                mediaUrl,
                mediaType,
                caption: formData.caption || undefined,
                tags: formData.tags.length > 0 ? formData.tags : undefined,
                visibility: formData.visibility,
                isAIGenerated: isAIFlow,
                aiPrompt: isAIFlow ? aiPrompt : undefined,
            });

            setResultModal({
                isOpen: true,
                type: 'success',
                title: 'Meme Posted!',
                message: 'Your meme is now live. Time to collect those laughs!',
            });
        } catch {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: "Oops... That Didn't Work",
                message: 'Something went wrong. Please try again.',
            });
        }
    };

    const handleResultClose = () => {
        setResultModal(prev => ({ ...prev, isOpen: false }));
        if (resultModal.type === 'success' && resultModal.title === 'Meme Posted!') {
            navigate(ROUTES.HOME);
        }
    };

    // Compute button state
    const isGenerating = aiMutation.isPending || isUploadingReference;
    const getButtonText = () => {
        if (isUploadingReference) return `Uploading... ${uploadProgress}%`;
        if (aiMutation.isPending) return 'Cooking...';
        return 'Cook Meme';
    };

    // ============ Render AI Prompt Step ============
    const renderAIPromptStep = () => (
        <div className="create-ai-page">
            <header className="create-header">
                <button className="icon-button" onClick={handleBack}>
                    <img src={iconBack} alt="" />
                </button>
                <span className="create-title">Make a Meme</span>
                <button className="icon-button" onClick={handleClose}>
                    <img src={iconClose} alt="" />
                </button>
            </header>

            <div className="ai-hero">
                <div className="ai-illustration">
                    <img className="ai-burst" src={ornament} alt="" />
                    <img className="ai-face" src={aiLaughFace} alt="" />
                </div>
            </div>

            <div className="ai-body">
                <div className="ai-templates">
                    <span className="ai-label">Templates :</span>
                    <div className="ai-tabs">
                        <button
                            className={`ai-tab ${aiTemplate === 'image' ? 'active' : ''}`}
                            onClick={() => setAiTemplate('image')}
                        >
                            Image Meme
                        </button>
                        <button
                            className={`ai-tab ${aiTemplate === 'video' ? 'active' : ''}`}
                            onClick={() => setAiTemplate('video')}
                        >
                            Video Meme (10s)
                        </button>
                    </div>
                </div>

                <div className="ai-form">
                    <div className="ai-textarea">
                        <textarea
                            placeholder="Describe your meme..."
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            maxLength={140}
                        />
                        <span className="ai-char">{aiPrompt.length}/140</span>
                        <button
                            className="ai-add-media"
                            onClick={handleAddReferenceMedia}
                            disabled={isGenerating}
                        >
                            + Add Image/Video
                        </button>
                    </div>

                    {/* Reference media preview */}
                    {aiReferenceMedia && (
                        <div className="ai-reference-preview">
                            {aiReferenceMedia.type === 'video' ? (
                                <video src={aiReferenceMedia.previewUrl} />
                            ) : (
                                <img src={aiReferenceMedia.previewUrl} alt="Reference" />
                            )}
                            <button
                                className="ai-reference-remove"
                                onClick={handleRemoveReferenceMedia}
                                disabled={isGenerating}
                            >
                                ×
                            </button>
                            {isUploadingReference && (
                                <div className="ai-reference-progress">
                                    <div
                                        className="ai-reference-progress-bar"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="ai-footer">
                <div className="ai-credits-row">
                    <span className="credit-pill green">
                        <img src={iconPowerUp} alt="" />
                        {credits} Credits
                    </span>
                    <button
                        className="add-more-btn"
                        onClick={() => setShowPowerUpModal(true)}
                    >
                        Add More ▾
                    </button>
                </div>
                <button
                    className="ai-cta"
                    onClick={handleCookMeme}
                    disabled={!aiPrompt.trim() || isGenerating}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );

    // ============ Render AI Result Step ============
    const renderAIResultStep = () => (
        <div className="create-ai-page result">
            <header className="create-header">
                <button className="icon-button" onClick={handleBack}>
                    <img src={iconBack} alt="" />
                </button>
                <span className="create-title">Make a Meme</span>
                <button className="icon-button" onClick={handleClose}>
                    <img src={iconClose} alt="" />
                </button>
            </header>

            <div className="ai-result-preview">
                {mediaType === 'video' ? (
                    <video src={previewUrl} controls autoPlay loop />
                ) : (
                    <img src={previewUrl} alt="Generated meme" />
                )}
            </div>

            <div className="ai-footer">
                <button className="ai-cta" onClick={handleNextFromResult}>
                    Next
                </button>
            </div>
        </div>
    );

    // ============ Render Post Form Step ============
    const renderPostFormStep = () => (
        <div className="create-post-page">
            <header className="create-header">
                <button className="icon-button" onClick={handleBack}>
                    <img src={iconBack} alt="" />
                </button>
                <span className="create-title">Upload Media</span>
                <button className="icon-button" onClick={handleClose}>
                    <img src={iconClose} alt="" />
                </button>
            </header>

            <div className="post-body">
                <div className="post-preview">
                    {mediaType === 'video' ? (
                        <video src={previewUrl || mediaUrl} controls />
                    ) : (
                        <img src={previewUrl || mediaUrl} alt="Preview" />
                    )}
                </div>

                <div className="post-form">
                    <div className="form-group">
                        <label>Aa</label>
                        <div className="post-input-wrap">
                            <textarea
                                placeholder="Add description..."
                                value={formData.caption}
                                onChange={e => handleCaptionChange(e.target.value)}
                                maxLength={MAX_CAPTION}
                            />
                            <span className="char-count">{formData.caption.length}/{MAX_CAPTION}</span>
                        </div>
                    </div>

                    <div className="post-tags-wrap">
                        <div className="tag-list">
                            {formData.tags.map(tag => (
                                <span key={`tag-${tag}`} className="tag-chip">
                                    #{tag}
                                    <button onClick={() => handleRemoveTag(tag)}>×</button>
                                </span>
                            ))}
                        </div>
                        <input
                            className="tag-input"
                            placeholder={formData.tags.length < MAX_TAGS ? "#meme" : ""}
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={handleAddTag}
                            disabled={formData.tags.length >= MAX_TAGS}
                        />
                    </div>

                    <button
                        className="visibility-btn"
                        onClick={() => setShowVisibilitySheet(true)}
                    >
                        <span className="vis-label">Share with</span>
                        <span className="vis-value">
                            {formData.visibility === 'public' ? 'Everyone' : 'Only Me'}
                        </span>
                        <span className="vis-caret">▾</span>
                    </button>
                </div>
            </div>

            <button
                className="post-cta"
                onClick={handlePostMeme}
                disabled={createMemeMutation.isPending}
            >
                {createMemeMutation.isPending ? 'Posting...' : 'Post Meme'}
            </button>
        </div>
    );

    // ============ Render Power Up Modal ============
    const renderPowerUpModal = () => {
        const uniquePackages = (packagesData ?? [])
            .filter((pkg, index, arr) =>
                arr.findIndex(p => p.packageId === pkg.packageId) === index
            )
            .sort((a, b) => a.credits - b.credits);

        return (
            <div className={`power-modal ${showPowerUpModal ? 'open' : ''}`}>
                <div className="power-sheet">
                    <header className="power-header">
                        <span className="power-title">Power Up Your Meme Magic</span>
                        <button className="icon-button" onClick={() => {
                            setShowPowerUpModal(false);
                            setSelectedPackageId(null);
                        }}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>

                    <div className="power-balances">
                        <div className="power-balance">
                            <span className="label">Credits:</span>
                            <span className="badge green">
                                <img src={iconPowerUp} alt="" />
                                {credits}
                            </span>
                        </div>
                        <div className="power-balance">
                            <span className="label">BONK Balance:</span>
                            <span className="badge yellow">
                                <img src={iconBonk} alt="" />
                                {bonkBalance.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="power-cards">
                        {uniquePackages.map((pkg) => {
                            const isSelected = selectedPackageId === pkg.packageId;
                            const hasEnoughBonk = bonkBalance >= (pkg.bonkCost ?? 0);

                            return (
                                <button
                                    key={pkg.packageId}
                                    className={`power-card ${isSelected ? 'selected' : ''} ${!hasEnoughBonk ? 'insufficient' : ''}`}
                                    onClick={() => handleSelectPackage(pkg.packageId)}
                                >
                                    <div className="power-head">
                                        <img src={iconPowerUp} alt="" />
                                    </div>
                                    <span className="title">{pkg.credits} Credits</span>
                                    <span className="price">
                                        <img src={iconBonk} alt="" />
                                        {pkg.bonkCost?.toLocaleString() ?? 0}
                                    </span>
                                    {!hasEnoughBonk && (
                                        <span className="insufficient-label">Insufficient BONK</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className="power-cta"
                        onClick={handlePowerUpClick}
                        disabled={!selectedPackageId || purchaseMutation.isPending}
                    >
                        {purchaseMutation.isPending ? 'Processing...' : 'Power Up'}
                    </button>
                </div>
            </div>
        );
    };

    // ============ Main Render ============
    return (
        <div className="create-meme-shell">
            {step === 'ai-prompt' && renderAIPromptStep()}
            {step === 'ai-result' && renderAIResultStep()}
            {step === 'post-form' && renderPostFormStep()}

            {renderPowerUpModal()}

            <MediaPickerModal
                isOpen={showAIMediaPicker}
                onClose={() => setShowAIMediaPicker(false)}
                onNext={handleAIMediaSelected}
            />

            {showVisibilitySheet && (
                <div className="visibility-modal open" onClick={() => setShowVisibilitySheet(false)}>
                    <div className="visibility-sheet" onClick={e => e.stopPropagation()}>
                        <header className="vis-header">
                            <span>Share to</span>
                            <button className="icon-button" onClick={() => setShowVisibilitySheet(false)}>
                                <img src={iconClose} alt="" />
                            </button>
                        </header>
                        <button className="vis-option" onClick={() => handleVisibilitySelect('public')}>
                            Everyone
                        </button>
                        <button className="vis-option" onClick={() => handleVisibilitySelect('private')}>
                            Only Me
                        </button>
                        <button className="vis-cancel" onClick={() => setShowVisibilitySheet(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showDiscardModal && (
                <div className="discard-modal open">
                    <div className="discard-sheet">
                        <header className="discard-header">
                            <span>Discard post</span>
                            <button className="icon-button" onClick={() => setShowDiscardModal(false)}>
                                <img src={iconClose} alt="" />
                            </button>
                        </header>
                        <p className="discard-body">
                            Are you sure you want to discard this post? Your changes will be lost.
                        </p>
                        <div className="discard-actions">
                            <button className="discard-btn confirm" onClick={handleDiscard}>
                                Discard
                            </button>
                            <button className="discard-btn cancel" onClick={() => setShowDiscardModal(false)}>
                                Don't discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resultModal.isOpen && (
                <div className="result-modal open">
                    <div className="result-sheet">
                        <div className="result-illustration">
                            <img className="result-burst" src={ornament} alt="" />
                            <img
                                className="result-icon"
                                src={resultModal.type === 'success' ? successIllustration : failIllustration}
                                alt=""
                            />
                        </div>
                        <div className="result-copy">
                            <h3 className="result-title">{resultModal.title}</h3>
                            <p className="result-message">{resultModal.message}</p>
                        </div>
                        <div className="result-actions">
                            {resultModal.type === 'error' && (
                                <button
                                    className="result-btn secondary"
                                    onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))}
                                >
                                    Close
                                </button>
                            )}
                            <button
                                className="result-btn primary"
                                onClick={handleResultClose}
                            >
                                {resultModal.type === 'success' && resultModal.title === 'Juiced Up!'
                                    ? 'Unleash It'
                                    : resultModal.type === 'error'
                                        ? 'Retry'
                                        : 'Okay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}