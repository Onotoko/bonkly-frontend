import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LaughSheet, CommentSheet, MoreSheet, ShareSheet } from '@/components/meme';

// Icons
import iconSearch from '@/assets/icons/icon-search.svg';
import iconMore from '@/assets/icons/icon-more.svg';
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconHeartDefault from '@/assets/icons/icon-heart-default.svg';
import iconCommentDefault from '@/assets/icons/icon-comment-default.svg';
import iconShareDefault from '@/assets/icons/icon-share-default.svg';
import iconCreateMeme from '@/assets/icons/icon-create-meme.png';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';
import emptyImage from '@/assets/images/empty-image.png';
import homeOrnament from '@/assets/images/home-ornament.png';

type FeedTab = 'trending' | 'new' | 'foryou';

const MOCK_MEMES = [
    {
        id: '1',
        author: { username: 'bronky', avatar: avatarDefault },
        createdAt: '2m ago',
        image: emptyImage,
        caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        tags: ['#tag', '#tag'],
        reward: '100k',
        stats: { laughs: '200k', likes: '10k', comments: '250k', shares: '77k' },
    },
    {
        id: '2',
        author: { username: 'memelord', avatar: avatarDefault },
        createdAt: '5m ago',
        image: emptyImage,
        caption: 'Another day, another meme ready to bonk the timeline.',
        tags: ['#bonk', '#meme'],
        reward: '42k',
        stats: { laughs: '88k', likes: '12k', comments: '9k', shares: '1.2k' },
    },
];

export function HomePage() {
    const [activeTab, setActiveTab] = useState<FeedTab>('trending');

    // Laugh Sheet state
    const [laughSheet, setLaughSheet] = useState<{ isOpen: boolean; handle: string }>({
        isOpen: false,
        handle: '',
    });

    // Comment Sheet state
    const [commentSheet, setCommentSheet] = useState<{ isOpen: boolean; handle: string }>({
        isOpen: false,
        handle: '',
    });

    // Laugh Sheet handlers
    const openLaughSheet = (handle: string) => {
        setLaughSheet({ isOpen: true, handle });
    };

    const closeLaughSheet = () => {
        setLaughSheet({ isOpen: false, handle: '' });
    };

    const handleLaughSubmit = (amount: number) => {
        console.log('Laugh submitted:', amount, 'Bonk to', laughSheet.handle);
        // TODO: Call API
    };

    // Comment Sheet handlers
    const openCommentSheet = (handle: string) => {
        setCommentSheet({ isOpen: true, handle });
    };

    const closeCommentSheet = () => {
        setCommentSheet({ isOpen: false, handle: '' });
    };

    const handleCommentSubmit = (text: string) => {
        console.log('Comment submitted:', text, 'to', commentSheet.handle);
        // TODO: Call API
    };

    // More Sheet state
    const [moreSheet, setMoreSheet] = useState<{ isOpen: boolean; handle: string }>({
        isOpen: false,
        handle: '',
    });

    // Share Sheet state
    const [shareSheetOpen, setShareSheetOpen] = useState(false);

    // More Sheet handlers
    const openMoreSheet = (handle: string) => {
        setMoreSheet({ isOpen: true, handle });
    };

    const closeMoreSheet = () => {
        setMoreSheet({ isOpen: false, handle: '' });
    };

    const handleFavorite = () => {
        console.log('Favorite:', moreSheet.handle);
        closeMoreSheet();
    };

    const handleReport = () => {
        console.log('Report:', moreSheet.handle);
        closeMoreSheet();
    };

    // Share Sheet handlers
    const openShareSheet = () => {
        setShareSheetOpen(true);
    };

    const closeShareSheet = () => {
        setShareSheetOpen(false);
    };

    const handleCopyLink = () => {
        console.log('Copy link');
        closeShareSheet();
    };

    const handleShare = (platform: string) => {
        console.log('Share to:', platform);
        closeShareSheet();
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
                <Link to={ROUTES.HOME} className="search-btn" aria-label="Search">
                    <img src={iconSearch} alt="" />
                </Link>
            </header>

            {/* Feed */}
            <main className="home-feed">
                {MOCK_MEMES.map((meme) => (
                    <article key={meme.id} className="feed-card">
                        {/* Card Header */}
                        <header className="feed-card__header">
                            <div className="feed-author">
                                <div className="feed-avatar">
                                    <img src={meme.author.avatar} alt="" />
                                </div>
                                <div className="author-meta">
                                    <span className="author-handle">@{meme.author.username}</span>
                                    <span className="author-time">{meme.createdAt}</span>
                                </div>
                            </div>
                            <button className="more-btn"
                                aria-label="More options"
                                onClick={() => openMoreSheet(`@${meme.author.username}`)}>
                                <img src={iconMore} alt="" />
                            </button>
                        </header>

                        {/* Media */}
                        <div className="feed-media">
                            <img src={meme.image} alt="Meme" />
                        </div>

                        {/* Body */}
                        <div className="feed-body">
                            <p className="feed-text">{meme.caption}</p>
                            <div className="feed-tags">
                                {meme.tags.map((tag, i) => (
                                    <span key={i} className="feed-tag">{tag}</span>
                                ))}
                            </div>
                            <div className="feed-meta">
                                <div className="feed-reward">
                                    <img src={iconBonk} alt="Bonk" />
                                    <span>{meme.reward} Bonk</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <footer className="feed-actions">
                            <button
                                className="feed-action"
                                onClick={() => openLaughSheet(`@${meme.author.username}`)}
                            >
                                <img src={iconLaughDefault} alt="" />
                                <span>{meme.stats.laughs}</span>
                            </button>
                            <button className="feed-action">
                                <img src={iconHeartDefault} alt="" />
                                <span>{meme.stats.likes}</span>
                            </button>
                            <button
                                className="feed-action"
                                onClick={() => openCommentSheet(`@${meme.author.username}`)}
                            >
                                <img src={iconCommentDefault} alt="" />
                                <span>{meme.stats.comments}</span>
                            </button>
                            <button className="feed-action" onClick={openShareSheet}>
                                <img src={iconShareDefault} alt="" />
                                <span>{meme.stats.shares}</span>
                            </button>
                        </footer>
                    </article>
                ))}
            </main>

            {/* FAB - Create Meme */}
            <Link to={ROUTES.CREATE_MEME} className="fab-create">
                <div className="fab-icon-wrap">
                    <img src={iconCreateMeme} alt="" />
                </div>
                <span className="fab-label">+ Post Meme</span>
            </Link>

            {/* Laugh Sheet */}
            <LaughSheet
                isOpen={laughSheet.isOpen}
                onClose={closeLaughSheet}
                handle={laughSheet.handle}
                laughWeight={5.7}
                onSubmit={handleLaughSubmit}
            />

            {/* Comment Sheet */}
            <CommentSheet
                isOpen={commentSheet.isOpen}
                onClose={closeCommentSheet}
                handle={commentSheet.handle}
                comments={[]}
                onSubmit={handleCommentSubmit}
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
                isOpen={shareSheetOpen}
                onClose={closeShareSheet}
                onCopyLink={handleCopyLink}
                onShare={handleShare}
            />
        </div>
    );
}