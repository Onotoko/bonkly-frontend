import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores';
import { userService } from '@/services/user.service';
import { uploadService } from '@/services/upload.service';
import { authService } from '@/services/auth.service';
import { CreateMemeSheet } from '@/components/meme';
import { ResultModal } from '@/components/ui';

// React Query hooks
import { useUserMemes, useLovedMemes } from '@/hooks/queries';

import type { Meme } from '@/types/api';

// Icons
import iconMenu from '@/assets/icons/icon-menu.svg';
import iconClose from '@/assets/icons/icon-close.svg';
import iconProfileGrey from '@/assets/icons/icon-profile-grey.svg';
import iconProfileSecurity from '@/assets/icons/icon-profile-security.svg';
import iconProfileSecurityStar from '@/assets/icons/icon-profile-security-star.svg';
import iconArrowRight from '@/assets/icons/icon-arrow-right.svg';
import iconProfileFeedDefault from '@/assets/icons/icon-profile-feed.svg';
import iconProfileLockpadDefault from '@/assets/icons/icon-profile-lockpad.svg';
import iconProfileLoveDefault from '@/assets/icons/icon-profile-love.svg';
import iconProfileFeedActive from '@/assets/icons/icon-meme-image.svg';
import iconProfileLockpadActive from '@/assets/icons/icon-profile-lockpad.svg';
import iconProfileLoveActive from '@/assets/icons/icon-heart-active.svg';

// Images
import emptyMeme from '@/assets/illustrations/empty-laugh.png';
import avatarDefault from '@/assets/images/avatar-default.png';

type ProfileTab = 'public' | 'private' | 'loved';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, setUser } = useAuthStore();
    const gridRef = useRef<HTMLElement>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<ProfileTab>('public');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);

    // Social counts (fetched separately since User type doesn't include them)
    const [socialCounts, setSocialCounts] = useState({ followerCount: 0, followingCount: 0 });

    // Result modal state
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // React Query - User's PUBLIC memes (Tab 1)
    const publicMemesQuery = useUserMemes(user?.username || '', 'public');
    const publicMemes = publicMemesQuery.data?.pages.flatMap((page) => page.memes) ?? [];

    // React Query - User's PRIVATE memes (Tab 2)
    const privateMemesQuery = useUserMemes(user?.username || '', 'private');
    const privateMemes = privateMemesQuery.data?.pages.flatMap((page) => page.memes) ?? [];

    // React Query - Loved memes (Tab 3)
    const lovedQuery = useLovedMemes();
    const lovedMemes = lovedQuery.data?.pages.flatMap((page) => page.memes) ?? [];

    // Debug log
    useEffect(() => {
        console.log('ProfilePage - Username:', user?.username);
        console.log('ProfilePage - Public query status:', publicMemesQuery.status);
        console.log('ProfilePage - Public memes:', publicMemes);
    }, [user?.username, publicMemesQuery.status, publicMemes]);

    // Fetch social counts on mount
    useEffect(() => {
        if (user?.username) {
            userService.getByUsername(user.username)
                .then((profile) => {
                    setSocialCounts({
                        followerCount: profile.followerCount ?? 0,
                        followingCount: profile.followingCount ?? 0,
                    });
                })
                .catch(console.error);
        }
    }, [user?.username]);

    // Get current tab data
    const getCurrentTabData = () => {
        switch (activeTab) {
            case 'public':
                return {
                    memes: publicMemes,
                    isLoading: publicMemesQuery.isLoading,
                    hasNextPage: publicMemesQuery.hasNextPage,
                    isFetchingNextPage: publicMemesQuery.isFetchingNextPage,
                    fetchNextPage: publicMemesQuery.fetchNextPage,
                };
            case 'private':
                return {
                    memes: privateMemes,
                    isLoading: privateMemesQuery.isLoading,
                    hasNextPage: privateMemesQuery.hasNextPage,
                    isFetchingNextPage: privateMemesQuery.isFetchingNextPage,
                    fetchNextPage: privateMemesQuery.fetchNextPage,
                };
            case 'loved':
                return {
                    memes: lovedMemes,
                    isLoading: lovedQuery.isLoading,
                    hasNextPage: lovedQuery.hasNextPage,
                    isFetchingNextPage: lovedQuery.isFetchingNextPage,
                    fetchNextPage: lovedQuery.fetchNextPage,
                };
        }
    };

    const { memes, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = getCurrentTabData();

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (!gridRef.current || isFetchingNextPage || !hasNextPage) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Edit profile state
    const [editForm, setEditForm] = useState({
        displayName: '',
        username: '',
        bio: '',
        profilePicture: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize edit form when user data is available
    useEffect(() => {
        if (user) {
            setEditForm({
                displayName: user.displayName || '',
                username: user.username || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
            });
        }
    }, [user]);

    const handleOpenEditProfile = () => {
        setIsSettingsOpen(false);
        setIsEditProfileOpen(true);
        setPreviewImage(null);
        setUploadError(null);
        setIsUploading(false);
    };

    const handleCloseEditProfile = () => {
        setIsEditProfileOpen(false);
        setIsSettingsOpen(true);
        if (user) {
            setEditForm({
                displayName: user.displayName || '',
                username: user.username || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
            });
        }
        setPreviewImage(null);
        setUploadError(null);
        setIsUploading(false);
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
        reader.readAsDataURL(file);

        try {
            const result = await uploadService.uploadMedia(file);
            setEditForm((prev) => ({ ...prev, profilePicture: result.mediaUrl }));
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadError('Failed to upload image. Please try again.');
            setPreviewImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (isUploading) return;
        if (uploadError) {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: 'Upload Failed',
                message: 'Please fix the image upload error before saving.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const updated = await userService.updateProfile({
                displayName: editForm.displayName,
                bio: editForm.bio,
                profilePicture: editForm.profilePicture,
            });
            setUser({ ...user!, ...updated });
            setIsEditProfileOpen(false);
            setResultModal({
                isOpen: true,
                type: 'success',
                title: 'Profile Updated',
                message: "Your profile has been successfully updated. You're all set!",
            });
        } catch {
            setIsEditProfileOpen(false);
            setResultModal({
                isOpen: true,
                type: 'error',
                title: 'Update Failed',
                message: "We couldn't update your profile. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenAccount = () => {
        setIsSettingsOpen(false);
        setIsAccountOpen(true);
    };

    const handleCloseAccount = () => {
        setIsAccountOpen(false);
        setIsSettingsOpen(true);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            logout();
            navigate(ROUTES.WELCOME);
        }
    };

    const maskEmail = (email: string) => {
        const [local, domain] = email.split('@');
        return `${local[0]}${'*'.repeat(Math.min(5, local.length - 1))}@${domain}`;
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
        return count.toString();
    };

    // Get empty state message
    const getEmptyMessage = () => {
        switch (activeTab) {
            case 'public':
                return 'Make your most best meme';
            case 'private':
                return 'No private memes yet';
            case 'loved':
                return 'No loved memes yet';
        }
    };

    // Navigate to followers/following pages
    const handleFollowersClick = () => {
        if (user?.username) {
            navigate(ROUTES.FOLLOWERS.replace(':username', user.username));
        }
    };

    const handleFollowingClick = () => {
        if (user?.username) {
            navigate(ROUTES.FOLLOWING.replace(':username', user.username));
        }
    };

    return (
        <div className="profile-shell">
            {/* Header */}
            <header className="profile-top">
                <h1>Profile</h1>
                <button className="icon-button" onClick={() => setIsSettingsOpen(true)}>
                    <img src={iconMenu} alt="Menu" />
                </button>
            </header>

            {/* Hero Section */}
            <section className="profile-hero">
                <div className="profile-avatar">
                    <img src={user?.profilePicture || avatarDefault} alt="Avatar" />
                </div>
                <div className="profile-info">
                    <div className="profile-name">{user?.displayName || 'User'}</div>
                    <div className="profile-handle">@{user?.username || 'username'}</div>
                    <div className="profile-stats">
                        <button className="stat" onClick={handleFollowingClick}>
                            <div className="stat-value">{formatCount(socialCounts.followingCount)}</div>
                            <div className="stat-label">Following</div>
                        </button>
                        <button className="stat" onClick={handleFollowersClick}>
                            <div className="stat-value">{formatCount(socialCounts.followerCount)}</div>
                            <div className="stat-label">Followers</div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Bio Section */}
            <section className="profile-bio-section">
                {user?.bio ? (
                    <p className="profile-bio-text">{user.bio}</p>
                ) : (
                    <p className="profile-bio-empty">No bio yet</p>
                )}
                <button className="add-bio-btn" onClick={handleOpenEditProfile}>
                    <span className="add-bio-icon">+</span>
                    <span>{user?.bio ? 'Edit Bio' : 'Add Bio'}</span>
                </button>
            </section>

            {/* Tabs */}
            <nav className="profile-tabs">
                <button
                    className={`tab-item ${activeTab === 'public' ? 'active' : ''}`}
                    onClick={() => setActiveTab('public')}
                >
                    <img
                        src={activeTab === 'public' ? iconProfileFeedActive : iconProfileFeedDefault}
                        alt=""
                    />
                </button>
                <button
                    className={`tab-item ${activeTab === 'private' ? 'active' : ''}`}
                    onClick={() => setActiveTab('private')}
                >
                    <img
                        src={activeTab === 'private' ? iconProfileLockpadActive : iconProfileLockpadDefault}
                        alt=""
                    />
                </button>
                <button
                    className={`tab-item ${activeTab === 'loved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loved')}
                >
                    <img
                        src={activeTab === 'loved' ? iconProfileLoveActive : iconProfileLoveDefault}
                        alt=""
                    />
                </button>
            </nav>

            {/* Content */}
            {isLoading ? (
                <div className="profile-empty">
                    <p>Loading...</p>
                </div>
            ) : memes.length > 0 ? (
                <>
                    <section className="profile-grid" ref={gridRef}>
                        {memes.map((meme: Meme) => (
                            meme.mediaType === 'video' ? (
                                <video
                                    key={meme.id}
                                    src={meme.mediaUrl}
                                    onClick={() => navigate(`/meme/${meme.id}`)}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    poster=""
                                    onLoadedData={(e) => {
                                        const video = e.currentTarget;
                                        video.currentTime = 0.1;
                                    }}
                                />
                            ) : (
                                <img
                                    key={meme.id}
                                    src={meme.mediaUrl}
                                    alt=""
                                    onClick={() => navigate(`/meme/${meme.id}`)}
                                />
                            )
                        ))}
                    </section>
                    {isFetchingNextPage && (
                        <div className="profile-loading-more">
                            <p>Loading more...</p>
                        </div>
                    )}
                </>
            ) : (
                <section className="profile-empty">
                    <img src={emptyMeme} alt="" className="empty-icon" />
                    <p>{getEmptyMessage()}</p>
                    {activeTab === 'public' && (
                        <button className="create-meme-btn" onClick={() => setIsMemeModalOpen(true)}>
                            Create a meme
                        </button>
                    )}
                </section>
            )}

            {/* Settings Modal */}
            <div
                className={`settings-modal ${isSettingsOpen ? 'open' : ''}`}
                onClick={(e) => e.target === e.currentTarget && setIsSettingsOpen(false)}
            >
                <div className="settings-sheet">
                    <header className="settings-header">
                        <div className="settings-title">Settings</div>
                        <button className="icon-button" onClick={() => setIsSettingsOpen(false)}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>
                    <div className="settings-list">
                        <button className="settings-item" onClick={handleOpenEditProfile}>
                            <span className="settings-icon">
                                <img src={iconProfileGrey} alt="" />
                            </span>
                            <span className="settings-label">Edit Profile</span>
                        </button>
                        <button className="settings-item" onClick={handleOpenAccount}>
                            <span className="settings-icon">
                                <img src={iconProfileSecurity} alt="" />
                            </span>
                            <span className="settings-label">Account</span>
                        </button>
                        <button className="settings-item" onClick={() => navigate(ROUTES.PRIVACY)}>
                            <span className="settings-icon">
                                <img src={iconProfileSecurityStar} alt="" />
                            </span>
                            <span className="settings-label">Privacy & Policy</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <div className={`edit-profile-modal ${isEditProfileOpen ? 'open' : ''}`}>
                <div className="edit-profile-sheet">
                    <header className="edit-header">
                        <div className="edit-title">Edit profile</div>
                        <button className="icon-button" onClick={handleCloseEditProfile}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>
                    <div className="edit-body">
                        <div className="edit-photo-group">
                            <div className="edit-avatar">
                                <img
                                    src={previewImage || editForm.profilePicture || avatarDefault}
                                    alt=""
                                />
                            </div>
                            <label className={`edit-photo-btn ${isUploading ? 'uploading' : ''}`}>
                                {isUploading ? (
                                    <>
                                        <span className="spinner small"></span> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <span>+</span> Change Photo
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handlePhotoChange}
                                    disabled={isUploading}
                                />
                            </label>
                            {uploadError && <p className="edit-photo-error">{uploadError}</p>}
                        </div>
                        <div className="edit-fields">
                            <input
                                className="edit-input"
                                type="text"
                                placeholder="Enter your display name..."
                                value={editForm.displayName}
                                onChange={(e) =>
                                    setEditForm((prev) => ({ ...prev, displayName: e.target.value }))
                                }
                            />
                            <div className="edit-username-field">
                                <input type="text" value={`@${editForm.username}`} disabled />
                                <span className="edit-hint">Only once</span>
                            </div>
                            <textarea
                                className="edit-bio-input"
                                placeholder="Write something funny..."
                                value={editForm.bio}
                                onChange={(e) =>
                                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                    <div className="edit-footer">
                        <button
                            className="edit-save-btn"
                            onClick={handleSaveProfile}
                            disabled={isSubmitting || isUploading}
                        >
                            {isSubmitting ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Modal */}
            <div className={`account-modal ${isAccountOpen ? 'open' : ''}`}>
                <div className="account-sheet">
                    <header className="account-header">
                        <div className="account-title">Account</div>
                        <button className="icon-button" onClick={handleCloseAccount}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>
                    <div className="account-list">
                        <div className="account-row">
                            <span className="account-label">Email</span>
                            <span className="account-value">
                                {user?.email ? maskEmail(user.email) : 'Not set'}
                            </span>
                        </div>
                        <button className="account-row logout-row" onClick={() => setIsLogoutOpen(true)}>
                            <span className="account-label">Log Out</span>
                            <img className="account-arrow" src={iconArrowRight} alt="" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <div
                className={`logout-modal ${isLogoutOpen ? 'open' : ''}`}
                onClick={(e) => e.target === e.currentTarget && setIsLogoutOpen(false)}
            >
                <div className="logout-sheet">
                    <header className="logout-header">
                        <div className="logout-title">Log out</div>
                        <button className="icon-button" onClick={() => setIsLogoutOpen(false)}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>
                    <div className="logout-body">Are you sure you want to log out?</div>
                    <div className="logout-actions">
                        <button className="logout-btn logout-cancel" onClick={handleLogout}>
                            Log out
                        </button>
                        <button className="logout-btn logout-confirm" onClick={() => setIsLogoutOpen(false)}>
                            Don't Log out
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Modal */}
            <ResultModal
                isOpen={resultModal.isOpen}
                type={resultModal.type}
                title={resultModal.title}
                message={resultModal.message}
                primaryLabel={resultModal.type === 'success' ? 'Done' : 'Try Again'}
                onPrimary={() => {
                    if (resultModal.type === 'error') {
                        setResultModal((prev) => ({ ...prev, isOpen: false }));
                        setIsEditProfileOpen(true);
                    } else {
                        setResultModal((prev) => ({ ...prev, isOpen: false }));
                    }
                }}
                secondaryLabel={resultModal.type === 'error' ? 'Close' : undefined}
                onSecondary={
                    resultModal.type === 'error'
                        ? () => setResultModal((prev) => ({ ...prev, isOpen: false }))
                        : undefined
                }
            />

            {/* Meme Creation Modal */}
            <CreateMemeSheet isOpen={isMemeModalOpen} onClose={() => setIsMemeModalOpen(false)} />
        </div>
    );
}