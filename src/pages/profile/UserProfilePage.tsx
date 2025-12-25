import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LaughSheet, CommentSheet, MoreSheet, ShareSheet } from '@/components/meme';
import { ResultModal } from '@/components/ui';

// Hooks
import { useUserMemes, useLoveMeme, useLaughMeme, useToggleSaveMeme } from '@/hooks/queries';
import { useFollow, useUnfollow, useUserByUsername } from '@/hooks/queries';
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

export function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((s) => s.user);

    // Fetch user profile
    const { data: userProfile, isLoading: isLoadingProfile } = useUserByUsername(username || '');

    // Fetch user memes - get first page data
    const {
        data: memesData,
        isLoading: isLoadingMemes,
        isError,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useUserMemes(username || '');
    const memes = memesData?.pages.flatMap((page) => page.memes) ?? [];

    // Check relationship
    const isFollowing = userProfile?.isFollowing ?? false;
    const isOwnProfile = currentUser?.username === username;

    // Mutations
    const loveMutation = useLoveMeme();
    const laughMutation = useLaughMeme();
    const saveMutation = useToggleSaveMeme();
    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();

    // Laugh effect animation
    const [laughingMemes, setLaughingMemes] = useState<Set<string>>(new Set());

    // Sheet states
    const [laughSheet, setLaughSheet] = useState<{ isOpen: boolean; memeId: string; handle: string }>({
        isOpen: false,
        memeId: '',
        handle: '',
    });
    const [commentSheet, setCommentSheet] = useState<{ isOpen: boolean; memeId: string; handle: string }>({
        isOpen: false,
        memeId: '',
        handle: '',
    });
    const [moreSheet, setMoreSheet] = useState<{ isOpen: boolean; memeId: string; handle: string }>({
        isOpen: false,
        memeId: '',
        handle: '',
    });
    const [shareSheet, setShareSheet] = useState<{ isOpen: boolean; memeId: string; caption?: string }>({
        isOpen: false,
        memeId: '',
        caption: '',
    });

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
        if (!username || isOwnProfile) return;
        if (isFollowing) {
            unfollowMutation.mutate(username);
        } else {
            followMutation.mutate(username);
        }
    };

    const openLaughSheet = (memeId: string, handle: string, hasLaughed: boolean) => {
        if (hasLaughed) return;
        setLaughSheet({ isOpen: true, memeId, handle });
    };
    const closeLaughSheet = () => setLaughSheet({ isOpen: false, memeId: '', handle: '' });

    const openCommentSheet = (memeId: string, handle: string) => {
        setCommentSheet({ isOpen: true, memeId, handle });
    };
    const closeCommentSheet = () => setCommentSheet({ isOpen: false, memeId: '', handle: '' });

    const openMoreSheet = (memeId: string, handle: string) => {
        setMoreSheet({ isOpen: true, memeId, handle });
    };
    const closeMoreSheet = () => setMoreSheet({ isOpen: false, memeId: '', handle: '' });

    const openShareSheet = (memeId: string, caption?: string) => {
        setShareSheet({ isOpen: true, memeId, caption });
    };
    const closeShareSheet = () => setShareSheet({ isOpen: false, memeId: '', caption: '' });

    const showSuccessModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'success', title, message });
    };
    const showErrorModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'error', title, message });
    };
    const closeResultModal = () => setResultModal((prev) => ({ ...prev, isOpen: false }));

    const handleLove = (memeId: string) => {
        loveMutation.mutate(memeId);
    };

    const handleLaughSubmit = (sliderPercentage: number) => {
        const { memeId, handle } = laughSheet;
        closeLaughSheet();
        setLaughingMemes((prev) => new Set(prev).add(memeId));

        laughMutation.mutate(
            { id: memeId, sliderPercentage },
            {
                onSuccess: (data) => {
                    setTimeout(() => {
                        setLaughingMemes((prev) => {
                            const next = new Set(prev);
                            next.delete(memeId);
                            return next;
                        });
                        showSuccessModal('Thank you!', `You've sent ${data.bonkSpent} BONK to ${handle}!`);
                    }, 1500);
                },
                onError: (error: unknown) => {
                    setLaughingMemes((prev) => {
                        const next = new Set(prev);
                        next.delete(memeId);
                        return next;
                    });
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
        if (moreSheet.memeId) saveMutation.mutate(moreSheet.memeId);
        closeMoreSheet();
    };

    const handleReport = () => {
        console.log('Report meme:', moreSheet.memeId);
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

    const isLoading = isLoadingProfile || isLoadingMemes;

    // Loading state
    if (isLoading) {
        return (
            <div className="post-shell">
                <header className="post-header">
                    <button className="icon-button" onClick={handleBack}>
                        <img src={iconBack} alt="Back" />
                    </button>
                    <div className="post-title">
                        Post <span className="handle">@{username}</span>
                    </div>
                    <button className="icon-button close" onClick={handleClose}>
                        <img src={iconClose} alt="" />
                    </button>
                </header>
                <div className="post-loading">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !userProfile) {
        return (
            <div className="post-shell">
                <header className="post-header">
                    <button className="icon-button" onClick={handleBack}>
                        <img src={iconBack} alt="Back" />
                    </button>
                    <div className="post-title">Error</div>
                    <button className="icon-button close" onClick={handleClose}>
                        <img src={iconClose} alt="" />
                    </button>
                </header>
                <div className="post-error">
                    <p>User not found</p>
                    <button onClick={handleBack}>Go Back</button>
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
                    Post <span className="handle">@{username}</span>
                </div>
                {!isOwnProfile && (
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
                {memes.length === 0 ? (
                    <div className="post-empty">
                        <p>No memes yet</p>
                    </div>
                ) : (
                    <>
                        {memes.map((meme) => (
                            <article key={meme.id} className="feed-card">
                                {/* Card Header */}
                                <header className="feed-card__header">
                                    <div className="feed-author">
                                        <div className="feed-avatar">
                                            <img src={meme.creator.profilePicture || avatarDefault} alt="" />
                                        </div>
                                        <div className="author-meta">
                                            <span className="author-handle">@{meme.creator.username}</span>
                                            <span className="author-time">{formatTime(meme.createdAt)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="more-btn"
                                        aria-label="More options"
                                        onClick={() => openMoreSheet(meme.id, `@${meme.creator.username}`)}
                                    >
                                        <img src={iconMore} alt="" />
                                    </button>
                                </header>

                                {/* Media */}
                                <div className="feed-media">
                                    {meme.mediaType === 'video' ? (
                                        <video src={meme.mediaUrl} controls />
                                    ) : (
                                        <img src={meme.mediaUrl} alt="Meme" />
                                    )}
                                    {laughingMemes.has(meme.id) && (
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
                                        onClick={() => openLaughSheet(meme.id, `@${meme.creator.username}`, meme.hasLaughed)}
                                    >
                                        <img src={meme.hasLaughed ? iconLaughActive : iconLaughDefault} alt="" />
                                        <span>{formatNumber(meme.laughCount)}</span>
                                    </button>
                                    <button
                                        className={`feed-action ${meme.hasLoved ? 'active' : ''}`}
                                        onClick={() => handleLove(meme.id)}
                                    >
                                        <img src={meme.hasLoved ? iconHeartActive : iconHeartDefault} alt="" />
                                        <span>{formatNumber(meme.loveCount)}</span>
                                    </button>
                                    <button
                                        className="feed-action"
                                        onClick={() => openCommentSheet(meme.id, `@${meme.creator.username}`)}
                                    >
                                        <img src={iconCommentDefault} alt="" />
                                        <span>{formatNumber(meme.commentCount)}</span>
                                    </button>
                                    <button
                                        className="feed-action"
                                        onClick={() => openShareSheet(meme.id, meme.caption)}
                                    >
                                        <img src={iconShareDefault} alt="" />
                                        <span>{formatNumber(meme.shareCount)}</span>
                                    </button>
                                </footer>
                            </article>
                        ))
                        }
                        {/* Load more */}
                        {hasNextPage && (
                            <button
                                className="load-more-btn"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load More'}
                            </button>
                        )}
                    </>
                )}
            </main>

            {/* Sheets */}
            <LaughSheet
                isOpen={laughSheet.isOpen}
                onClose={closeLaughSheet}
                handle={laughSheet.handle}
                onSubmit={handleLaughSubmit}
            />
            <CommentSheet
                isOpen={commentSheet.isOpen}
                onClose={closeCommentSheet}
                handle={commentSheet.handle}
                memeId={commentSheet.memeId}
            />
            <MoreSheet
                isOpen={moreSheet.isOpen}
                onClose={closeMoreSheet}
                handle={moreSheet.handle}
                onFavorite={handleFavorite}
                onReport={handleReport}
            />
            <ShareSheet
                isOpen={shareSheet.isOpen}
                onClose={closeShareSheet}
                memeId={shareSheet.memeId}
                caption={shareSheet.caption}
            />
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