import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LaughSheet, CommentSheet, MoreSheet, ShareSheet } from '@/components/meme';
import { ResultModal } from '@/components/ui';
import { CreateMemeSheet } from '@/components/meme';

// Hooks
import { useFeedTrending, useFeedNew, useFeedForYou, useLoveMeme, useLaughMeme } from '@/hooks/queries';

// Types
// import type { Meme } from '@/types/api';
import { useToggleSaveMeme } from '@/hooks/queries';

// Icons
import iconSearch from '@/assets/icons/icon-search.svg';
import iconMore from '@/assets/icons/icon-more.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconLaughActive from '@/assets/icons/icon-laugh-active.png';
import iconHeartDefault from '@/assets/icons/icon-heart-default.svg';
import iconHeartActive from '@/assets/icons/icon-heart-active.svg';
import iconCommentDefault from '@/assets/icons/icon-comment-default.svg';
import iconShareDefault from '@/assets/icons/icon-share-default.svg';
import iconCreateMeme from '@/assets/icons/icon-create-meme.png';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';
import homeOrnament from '@/assets/images/home-ornament.png';
import laughEffect from '@/assets/images/laugh-effect.png';

type FeedTab = 'trending' | 'new' | 'foryou';

export function HomePage() {
    const [activeTab, setActiveTab] = useState<FeedTab>('trending');

    // Fetch feeds based on active tab
    const trendingQuery = useFeedTrending();
    const newQuery = useFeedNew();
    const forYouQuery = useFeedForYou();

    // Get current feed data
    const getCurrentFeed = () => {
        switch (activeTab) {
            case 'trending':
                return trendingQuery;
            case 'new':
                return newQuery;
            case 'foryou':
                return forYouQuery;
        }
    };

    const currentFeed = getCurrentFeed();
    const memes = currentFeed.data?.pages.flatMap((page) => page.memes) ?? [];
    const isLoading = currentFeed.isLoading;
    const isError = currentFeed.isError;

    // Mutations
    const loveMutation = useLoveMeme();
    const laughMutation = useLaughMeme();
    const saveMutation = useToggleSaveMeme();
    // Laugh Sheet state
    const [laughSheet, setLaughSheet] = useState<{ isOpen: boolean; handle: string; memeId: string }>({
        isOpen: false,
        handle: '',
        memeId: '',
    });

    // Laugh effect animation
    const [laughingMemes, setLaughingMemes] = useState<Set<string>>(new Set());

    // Comment Sheet state
    const [commentSheet, setCommentSheet] = useState<{ isOpen: boolean; handle: string; memeId: string }>({
        isOpen: false,
        handle: '',
        memeId: '',
    });

    // More Sheet state
    const [moreSheet, setMoreSheet] = useState<{ isOpen: boolean; handle: string; memeId: string }>({
        isOpen: false,
        handle: '',
        memeId: '',
    });

    // Share Sheet state

    const [shareSheet, setShareSheet] = useState<{
        isOpen: boolean;
        memeId: string;
        caption?: string
    }>({
        isOpen: false,
        memeId: '',
        caption: '',
    });

    // Result modal state
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const [showCreateSheet, setShowCreateSheet] = useState(false);


    // Handlers
    const openLaughSheet = (handle: string, memeId: string, hasLaughed: boolean) => {
        if (hasLaughed) return;
        setLaughSheet({ isOpen: true, handle, memeId });
    };

    const closeLaughSheet = () => {
        setLaughSheet({ isOpen: false, handle: '', memeId: '' });
    };

    const openCommentSheet = (handle: string, memeId: string) => {
        setCommentSheet({ isOpen: true, handle, memeId });
    };

    const closeCommentSheet = () => {
        setCommentSheet({ isOpen: false, handle: '', memeId: '' });
    };

    const openMoreSheet = (handle: string, memeId: string) => {
        setMoreSheet({ isOpen: true, handle, memeId });
    };

    const closeMoreSheet = () => {
        setMoreSheet({ isOpen: false, handle: '', memeId: '' });
    };

    const openShareSheet = (memeId: string, caption?: string) => {
        setShareSheet({ isOpen: true, memeId, caption });
    };

    const closeShareSheet = () => {
        setShareSheet({ isOpen: false, memeId: '', caption: '' });
    };

    const showSuccessModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'success', title, message });
    };

    const showErrorModal = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'error', title, message });
    };

    const closeResultModal = () => {
        setResultModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Love/Like handler
    const handleLove = (memeId: string) => {
        loveMutation.mutate(memeId);
    };

    // Laugh submit handler
    const handleLaughSubmit = (sliderPercentage: number) => {
        const memeId = laughSheet.memeId;
        const handle = laughSheet.handle;

        closeLaughSheet();

        // Show effect animation
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
                        showSuccessModal(
                            'Thank you!',
                            `You've sent ${data.bonkSpent} BONK to ${handle}!`
                        );
                    }, 1500);
                },
                onError: (error: unknown) => {
                    setLaughingMemes((prev) => {
                        const next = new Set(prev);
                        next.delete(memeId);
                        return next;
                    });

                    // Extract error message from API response
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
        if (moreSheet.memeId) {
            saveMutation.mutate(moreSheet.memeId);
        }
        closeMoreSheet();
    };

    const handleReport = () => {
        console.log('Report:', moreSheet.memeId);
        closeMoreSheet();
    };


    // Format number helper
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    // Format time helper
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

    return (
        <div className="home-shell">
            {/* Background ornament */}
            <img
                src={homeOrnament}
                alt=""
                className="home-ornament"
                aria-hidden="true"
            />

            {/* Header */}
            <header className="home-header">
                <nav className="home-tabs">
                    {(['trending', 'new', 'foryou'] as FeedTab[]).map((tab) => (
                        <button
                            key={tab}
                            className={`home-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'foryou' ? 'For You' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
                <Link to={ROUTES.SEARCH} className="search-btn" aria-label="Search">
                    <img src={iconSearch} alt="" />
                </Link>
            </header>

            {/* Feed */}
            <main className="home-feed">
                {isLoading && (
                    <div className="feed-loading">
                        <p>Loading memes...</p>
                    </div>
                )}

                {isError && (
                    <div className="feed-error">
                        <p>Failed to load memes. Please try again.</p>
                        <button onClick={() => currentFeed.refetch()}>Retry</button>
                    </div>
                )}

                {!isLoading && !isError && memes.length === 0 && (
                    <div className="feed-empty">
                        <p>No memes yet. Be the first to post!</p>
                    </div>
                )}

                {memes.map((meme) => (
                    <article key={meme.id} className="feed-card">
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
                                onClick={() => openMoreSheet(`@${meme.creator.username}`, meme.id)}
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
                            {/* Laugh Effect Animation */}
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
                                onClick={() => openLaughSheet(`@${meme.creator.username}`, meme.id, meme.hasLaughed)}
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
                                onClick={() => openCommentSheet(`@${meme.creator.username}`, meme.id)}
                            >
                                <img src={iconCommentDefault} alt="" />
                                <span>{formatNumber(meme.commentCount)}</span>
                            </button>
                            <button className="feed-action" onClick={() => openShareSheet(meme.id, meme.caption)}>
                                <img src={iconShareDefault} alt="" />
                                <span>{formatNumber(meme.shareCount)}</span>
                            </button>

                        </footer>
                    </article>
                ))}

                {/* Load more */}
                {currentFeed.hasNextPage && (
                    <button
                        className="load-more-btn"
                        onClick={() => currentFeed.fetchNextPage()}
                        disabled={currentFeed.isFetchingNextPage}
                    >
                        {currentFeed.isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </button>
                )}
            </main>

            {/* FAB - Create Meme */}
            <button className="fab-create" onClick={() => setShowCreateSheet(true)}>
                <div className="fab-icon-wrap">
                    <img src={iconCreateMeme} alt="" />
                </div>
                <span className="fab-label">+ Post Meme</span>
            </button>

            <CommentSheet
                isOpen={commentSheet.isOpen}
                onClose={closeCommentSheet}
                handle={commentSheet.handle}
                memeId={commentSheet.memeId}
            />

            <LaughSheet
                isOpen={laughSheet.isOpen}
                onClose={closeLaughSheet}
                handle={laughSheet.handle}
                onSubmit={handleLaughSubmit}
            />

            {/* More Sheet */}
            <MoreSheet
                isOpen={moreSheet.isOpen}
                onClose={closeMoreSheet}
                handle={moreSheet.handle}
                onFavorite={handleFavorite}
                onReport={handleReport}
            />

            {/* Share Sheet */}
            <ShareSheet
                isOpen={shareSheet.isOpen}
                onClose={closeShareSheet}
                memeId={shareSheet.memeId}
                caption={shareSheet.caption}
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

            <CreateMemeSheet
                isOpen={showCreateSheet}
                onClose={() => setShowCreateSheet(false)}
            />
        </div>
    );
}