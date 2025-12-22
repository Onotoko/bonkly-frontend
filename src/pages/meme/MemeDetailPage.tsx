import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LaughSheet, CommentSheet, MoreSheet, ShareSheet } from '@/components/meme';
import { ResultModal } from '@/components/ui';

// Hooks
import { useMeme, useLoveMeme, useLaughMeme, useToggleSaveMeme } from '@/hooks/queries';
import { useFollow, useUnfollow, useIsFollowing } from '@/hooks/queries';
import { useAuthStore } from '@/stores/authStore';

// Icons
import iconBack from '@/assets/icons/icon-back.svg';
import iconClose from '@/assets/icons/icon-close.svg';
import iconMore from '@/assets/icons/icon-more.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconLaughActive from '@/assets/icons/icon-laugh-active.png';
import iconHeartDefault from '@/assets/icons/icon-heart-default.svg';
import iconHeartActive from '@/assets/icons/icon-heart-active.svg';
import iconCommentDefault from '@/assets/icons/icon-comment-default.svg';
import iconShareDefault from '@/assets/icons/icon-share-default.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';
import laughEffect from '@/assets/images/laugh-effect.png';

export function MemeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((s) => s.user);

    // Fetch meme data
    const { data: meme, isLoading, isError, refetch } = useMeme(id || '');

    // Check if following creator
    const creatorUsername = meme?.creator?.username || '';
    const { data: followingData } = useIsFollowing(creatorUsername);
    const isFollowing = followingData?.isFollowing ?? false;
    const isOwnMeme = currentUser?.username === creatorUsername;

    // Mutations
    const loveMutation = useLoveMeme();
    const laughMutation = useLaughMeme();
    const saveMutation = useToggleSaveMeme();
    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();

    // Laugh effect animation
    const [isLaughing, setIsLaughing] = useState(false);

    // Sheet states
    const [laughSheet, setLaughSheet] = useState({ isOpen: false });
    const [commentSheet, setCommentSheet] = useState({ isOpen: false });
    const [moreSheet, setMoreSheet] = useState({ isOpen: false });
    const [shareSheet, setShareSheet] = useState({ isOpen: false });

    // Result modal
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // Handlers
    const handleBack = () => navigate(-1);
    const handleClose = () => navigate(ROUTES.HOME);

    const handleFollow = () => {
        if (!creatorUsername || isOwnMeme) return;
        if (isFollowing) {
            unfollowMutation.mutate(creatorUsername);
        } else {
            followMutation.mutate(creatorUsername);
        }
    };

    const openLaughSheet = () => {
        if (meme?.hasLaughed) return;
        setLaughSheet({ isOpen: true });
    };

    const closeLaughSheet = () => setLaughSheet({ isOpen: false });
    const openCommentSheet = () => setCommentSheet({ isOpen: true });
    const closeCommentSheet = () => setCommentSheet({ isOpen: false });
    const openMoreSheet = () => setMoreSheet({ isOpen: true });
    const closeMoreSheet = () => setMoreSheet({ isOpen: false });
    const openShareSheet = () => setShareSheet({ isOpen: true });
    const closeShareSheet = () => setShareSheet({ isOpen: false });

    const showSuccessModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'success', title, message });
    };

    const showErrorModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'error', title, message });
    };

    const closeResultModal = () => {
        setResultModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleLove = () => {
        if (!id) return;
        loveMutation.mutate(id);
    };

    const handleLaughSubmit = (sliderPercentage: number) => {
        if (!id || !meme) return;
        closeLaughSheet();
        setIsLaughing(true);

        laughMutation.mutate(
            { id, sliderPercentage },
            {
                onSuccess: (data) => {
                    setTimeout(() => {
                        setIsLaughing(false);
                        showSuccessModal(
                            'Thank you!',
                            `You've sent ${data.bonkSpent} BONK to @${meme.creator.username}!`
                        );
                    }, 1500);
                },
                onError: (error: unknown) => {
                    setIsLaughing(false);
                    let errorMessage = 'Please try again.';
                    if (error && typeof error === 'object' && 'response' in error) {
                        const apiError = error as { response?: { data?: { message?: string } } };
                        errorMessage = apiError.response?.data?.message || errorMessage;
                    } else if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    showErrorModal('Something Went Wrong', errorMessage);
                },
            }
        );
    };

    const handleFavorite = () => {
        if (id) saveMutation.mutate(id);
        closeMoreSheet();
    };

    const handleReport = () => {
        console.log('Report meme:', id);
        closeMoreSheet();
    };

    // Format helpers
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="post-shell">
                <header className="post-header">
                    <button className="icon-button" onClick={handleBack}>
                        <img src={iconBack} alt="Back" />
                    </button>
                    <div className="post-title">Loading...</div>
                </header>
                <div className="post-loading">
                    <p>Loading meme...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !meme) {
        return (
            <div className="post-shell">
                <header className="post-header">
                    <button className="icon-button" onClick={handleBack}>
                        <img src={iconBack} alt="Back" />
                    </button>
                    <div className="post-title">Error</div>
                    <button className="icon-button" onClick={handleClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>
                <div className="post-error">
                    <p>Failed to load meme</p>
                    <button onClick={() => refetch()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="post-shell">
            {/* Header */}
            <header className="post-header">
                <button className="icon-button" onClick={handleBack} aria-label="Back">
                    <img src={iconBack} alt="" />
                </button>
                <div className="post-title">
                    Post <span className="handle">@{meme.creator.username}</span>
                </div>
                {!isOwnMeme && (
                    <button
                        className={`post-follow ${isFollowing ? 'following' : ''}`}
                        onClick={handleFollow}
                        disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
                <button className="icon-button close" onClick={handleClose} aria-label="Close">
                    <img src={iconClose} alt="" />
                </button>
            </header>

            {/* Feed */}
            <main className="post-feed">
                <article className="feed-card">
                    {/* Card Header */}
                    <header className="feed-card__header">
                        <div className="feed-author">
                            <div className="feed-avatar">
                                <img
                                    src={meme.creator.profilePicture || avatarDefault}
                                    alt=""
                                />
                            </div>
                            <div className="author-meta">
                                <span className="author-handle">@{meme.creator.username}</span>
                                <span className="author-time">{formatTime(meme.createdAt)}</span>
                            </div>
                        </div>
                        <button
                            className="more-btn"
                            aria-label="More options"
                            onClick={openMoreSheet}
                        >
                            <img src={iconMore} alt="" />
                        </button>
                    </header>

                    {/* Media */}
                    <div className="feed-media">
                        {meme.mediaType === 'video' ? (
                            <video src={meme.mediaUrl} controls />
                        ) : (
                            <img src={meme.mediaUrl} alt="Meme" className="post-image" />
                        )}
                        {/* Laugh Effect */}
                        {isLaughing && (
                            <img src={laughEffect} alt="" className="laugh-effect" />
                        )}
                    </div>

                    {/* Body */}
                    <div className="feed-body">
                        {meme.caption && <p className="feed-text">{meme.caption}</p>}
                        {meme.tags.length > 0 && (
                            <div className="feed-tags">
                                {meme.tags.map((tag, i) => (
                                    <span key={i} className="feed-tag">#{tag}</span>
                                ))}
                            </div>
                        )}
                        <div className="feed-meta">
                            <div className="feed-reward">
                                <img src={iconBonk} alt="Bonk" />
                                <span>{formatNumber(meme.totalBonkReceived)} Bonk</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <footer className="feed-actions">
                        <button
                            className={`feed-action ${meme.hasLaughed ? 'active' : ''}`}
                            onClick={openLaughSheet}
                        >
                            <img src={meme.hasLaughed ? iconLaughActive : iconLaughDefault} alt="" />
                            <span>{formatNumber(meme.laughCount)}</span>
                        </button>
                        <button
                            className={`feed-action ${meme.hasLoved ? 'active' : ''}`}
                            onClick={handleLove}
                        >
                            <img src={meme.hasLoved ? iconHeartActive : iconHeartDefault} alt="" />
                            <span>{formatNumber(meme.loveCount)}</span>
                        </button>
                        <button className="feed-action" onClick={openCommentSheet}>
                            <img src={iconCommentDefault} alt="" />
                            <span>{formatNumber(meme.commentCount)}</span>
                        </button>
                        <button className="feed-action" onClick={openShareSheet}>
                            <img src={iconShareDefault} alt="" />
                            <span>{formatNumber(meme.shareCount)}</span>
                        </button>
                    </footer>
                </article>
            </main>

            {/* Comment Sheet */}
            <CommentSheet
                isOpen={commentSheet.isOpen}
                onClose={closeCommentSheet}
                handle={`@${meme.creator.username}`}
                memeId={meme.id}
            />

            {/* Laugh Sheet */}
            <LaughSheet
                isOpen={laughSheet.isOpen}
                onClose={closeLaughSheet}
                handle={`@${meme.creator.username}`}
                onSubmit={handleLaughSubmit}
            />

            {/* More Sheet */}
            <MoreSheet
                isOpen={moreSheet.isOpen}
                onClose={closeMoreSheet}
                handle={`@${meme.creator.username}`}
                onFavorite={handleFavorite}
                onReport={handleReport}
            />

            {/* Share Sheet */}
            <ShareSheet
                isOpen={shareSheet.isOpen}
                onClose={closeShareSheet}
                memeId={meme.id}
                caption={meme.caption}
            />

            {/* Result Modal */}
            <ResultModal
                isOpen={resultModal.isOpen}
                type={resultModal.type}
                title={resultModal.title}
                message={resultModal.message}
                primaryLabel="Okay"
                onPrimary={closeResultModal}
            />
        </div>
    );
}