import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { memeService } from '@/services/meme.service';
import { useFollow, useUnfollow } from '@/hooks/queries';
import { useAuthStore } from '@/stores';
import { buildRoute } from '@/constants/routes';
import type { Meme, PublicUserProfile } from '@/types/api';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';

interface ProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
}

export function ProfileSheet({ isOpen, onClose, username }: ProfileSheetProps) {
    const navigate = useNavigate();
    const currentUser = useAuthStore((s) => s.user);

    const [user, setUser] = useState<PublicUserProfile | null>(null);
    const [memes, setMemes] = useState<Meme[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();

    // Reset state when sheet closes
    useEffect(() => {
        if (!isOpen) {
            setUser(null);
            setMemes([]);
            setError(null);
        }
    }, [isOpen]);

    // Fetch user profile and memes
    useEffect(() => {
        if (isOpen && username) {
            fetchUserData();
        }
    }, [isOpen, username]);

    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileRes, memesRes] = await Promise.all([
                userService.getByUsername(username),
                memeService.getUserMemes(username),
            ]);

            setUser(profileRes);
            setMemes(memesRes.memes);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = () => {
        if (!user) return;

        if (user.isFollowing) {
            unfollowMutation.mutate(user.username, {
                onSuccess: () => {
                    setUser((prev) =>
                        prev
                            ? {
                                ...prev,
                                isFollowing: false,
                                followerCount: prev.followerCount - 1,
                            }
                            : null
                    );
                },
            });
        } else {
            followMutation.mutate(user.username, {
                onSuccess: () => {
                    setUser((prev) =>
                        prev
                            ? {
                                ...prev,
                                isFollowing: true,
                                followerCount: prev.followerCount + 1,
                            }
                            : null
                    );
                },
            });
        }
    };

    const handleMemeClick = () => {
        onClose();
        // Navigate to user's memes feed page
        navigate(buildRoute.userProfile(username));
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
        return count.toString();
    };

    // Button text based on relationship state
    const getFollowButtonText = () => {
        if (!user) return 'Follow';
        if (user.isFollowing) return 'Unfollow';
        if (user.isFollowingYou) return 'Follow Back';
        return 'Follow';
    };

    const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;
    const isOwnProfile = currentUser?.username === username;
    const isMutualFollow = user?.isFollowing && user?.isFollowingYou;

    // Determine button class based on state
    const getFollowButtonClass = () => {
        if (!user) return '';
        if (user.isFollowing) return 'following'; // Unfollow state
        if (user.isFollowingYou) return 'follow-back'; // Follow Back state (purple)
        return ''; // Follow - default red style
    };

    if (!isOpen) return null;

    return (
        <div
            className="profile-sheet-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="profile-sheet">
                {/* Header */}
                <header className="profile-sheet-header">
                    <div className="profile-sheet-title">
                        <span className="title-label">Profile</span>
                        <span className="title-handle">@{username}</span>
                    </div>
                    <button className="icon-button" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>

                {/* Content */}
                <div className="profile-sheet-content">
                    {isLoading && (
                        <div className="profile-sheet-loading">
                            <p>Loading...</p>
                        </div>
                    )}

                    {error && (
                        <div className="profile-sheet-error">
                            <p>{error}</p>
                            <button onClick={fetchUserData}>Retry</button>
                        </div>
                    )}

                    {!isLoading && !error && user && (
                        <>
                            {/* User Info */}
                            <div className="profile-sheet-info">
                                <div className="profile-sheet-avatar">
                                    <img
                                        src={user.profilePicture || avatarDefault}
                                        alt={user.displayName}
                                    />
                                </div>
                                <h2 className="profile-sheet-name">{user.displayName}</h2>
                                {user.bio && <p className="profile-sheet-bio">{user.bio}</p>}
                                <div className="profile-sheet-stats">
                                    <span>{formatCount(user.followerCount)} Followers</span>
                                    {isMutualFollow && (
                                        <span className="profile-sheet-friend">- Friend</span>
                                    )}
                                </div>
                                {!isOwnProfile && (
                                    <button
                                        className={`profile-sheet-follow ${getFollowButtonClass()}`}
                                        onClick={handleFollow}
                                        disabled={isFollowLoading}
                                    >
                                        {isFollowLoading ? '...' : getFollowButtonText()}
                                    </button>
                                )}
                            </div>

                            {/* Memes Grid - Max 3 rows (9 items) */}
                            {memes.length > 0 ? (
                                <div className="profile-sheet-grid">
                                    {memes.slice(0, 9).map((meme) => (
                                        <div
                                            key={meme.id}
                                            className="profile-sheet-meme"
                                            onClick={handleMemeClick}
                                        >
                                            {meme.mediaType === 'video' ? (
                                                <video src={meme.mediaUrl} />
                                            ) : (
                                                <img src={meme.mediaUrl} alt="" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="profile-sheet-empty">
                                    <p>No memes yet</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}