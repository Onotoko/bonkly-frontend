import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useSearchMemes, useTrendingTags, useDebounce } from '@/hooks/queries';

// Icons
import iconBack from '@/assets/icons/icon-back.svg';
import iconSearch from '@/assets/icons/icon-search.svg';
import iconClose from '@/assets/icons/icon-close.svg';
import iconClock from '@/assets/icons/icon-clock.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';

const SEARCH_HISTORY_KEY = 'bonkly_search_history';
const MAX_HISTORY = 10;

// LocalStorage helpers
const getSearchHistory = (): string[] => {
    try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveSearchHistory = (history: string[]) => {
    try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch {
        // Ignore localStorage errors
    }
};

export function SearchPage() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [history, setHistory] = useState<string[]>(getSearchHistory);

    // Debounce search query
    const debouncedQuery = useDebounce(searchValue, 300);

    // Fetch trending tags
    const { data: trendingData } = useTrendingTags(10);
    const trendingTags = trendingData?.tags ?? [];

    // Search memes
    const {
        data: searchData,
        isLoading: isSearchLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSearchMemes(debouncedQuery);

    const searchResults = searchData?.pages.flatMap((page) => page.memes) ?? [];
    const showResults = debouncedQuery.length >= 2;

    // Add to history
    const addToHistory = useCallback((query: string) => {
        if (!query.trim()) return;

        setHistory((prev) => {
            const filtered = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
            const newHistory = [query.trim(), ...filtered].slice(0, MAX_HISTORY);
            saveSearchHistory(newHistory);
            return newHistory;
        });
    }, []);

    // Handlers
    const handleClear = () => {
        setSearchValue('');
    };

    const handleRemoveHistory = (index: number) => {
        setHistory((prev) => {
            const newHistory = prev.filter((_, i) => i !== index);
            saveSearchHistory(newHistory);
            return newHistory;
        });
    };

    const handleHistoryClick = (query: string) => {
        setSearchValue(query);
        addToHistory(query);
    };

    const handleTagClick = (tag: string) => {
        setSearchValue(tag);
        addToHistory(tag);
    };

    const handleSearch = () => {
        if (searchValue.trim().length >= 2) {
            addToHistory(searchValue.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleMemeClick = (memeId: string) => {
        navigate(`/meme/${memeId}`);
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    return (
        <div className="search-shell">
            {/* Header */}
            <header className="search-header">
                <Link to={ROUTES.HOME} className="icon-button back">
                    <img src={iconBack} alt="Back" />
                </Link>
                <div className="search-bar">
                    <img src={iconSearch} alt="" />
                    <input
                        type="text"
                        placeholder="Find best meme ever..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    {searchValue && (
                        <button className="icon-button search-clear" onClick={handleClear}>
                            <img src={iconClose} alt="Clear" />
                        </button>
                    )}
                </div>
                <button className="search-submit" onClick={handleSearch}>
                    Search
                </button>
            </header>

            {/* Content */}
            <main className="search-content">
                {/* Search Results */}
                {showResults ? (
                    <section className="search-results">
                        {isSearchLoading && (
                            <p className="search-loading">Searching...</p>
                        )}

                        {!isSearchLoading && searchResults.length === 0 && (
                            <p className="search-empty">No memes found for "{debouncedQuery}"</p>
                        )}

                        {searchResults.map((meme) => (
                            <article
                                key={meme.id}
                                className="search-result-item"
                                onClick={() => handleMemeClick(meme.id)}
                            >
                                <div className="result-thumbnail">
                                    <img src={meme.mediaUrl} alt="" />
                                </div>
                                <div className="result-info">
                                    <div className="result-author">
                                        <img
                                            src={meme.creator.profilePicture || avatarDefault}
                                            alt=""
                                            className="result-avatar"
                                        />
                                        <span>@{meme.creator.username}</span>
                                    </div>
                                    {meme.caption && (
                                        <p className="result-caption">{meme.caption}</p>
                                    )}
                                    <div className="result-stats">
                                        <span>😂 {formatNumber(meme.laughCount)}</span>
                                        <span>❤️ {formatNumber(meme.loveCount)}</span>
                                        <span>💬 {formatNumber(meme.commentCount)}</span>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {hasNextPage && (
                            <button
                                className="load-more-btn"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load More'}
                            </button>
                        )}
                    </section>
                ) : (
                    <>
                        {/* Search History */}
                        {history.length > 0 && (
                            <section className="search-history">
                                <ul>
                                    {history.map((item, index) => (
                                        <li key={index} onClick={() => handleHistoryClick(item)}>
                                            <span className="clock">
                                                <img src={iconClock} alt="" />
                                            </span>
                                            <span className="text">{item}</span>
                                            <button
                                                className="icon-button close"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveHistory(index);
                                                }}
                                            >
                                                <img src={iconClose} alt="Remove" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Trending Tags */}
                        {trendingTags.length > 0 && (
                            <section className="search-section">
                                <h2>Trending searches</h2>
                                <ul>
                                    {trendingTags.map((tag, index) => (
                                        <li key={index} onClick={() => handleTagClick(tag)}>
                                            <span className="dot red"></span>
                                            <span className="text">#{tag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="search-footer">
                <span>Help us improve</span>
            </footer>
        </div>
    );
}