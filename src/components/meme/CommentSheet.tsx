import { useState, useRef, useEffect } from 'react';
import {
    useComments,
    useReplies,
    useCreateComment,
    useToggleLikeComment,
} from '@/hooks/queries';
import { useAuthStore } from '@/stores';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';
import iconHeartDefault from '@/assets/icons/icon-heart-default.svg';
import iconHeartActive from '@/assets/icons/icon-heart-active.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';

interface CommentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    handle: string;
    memeId: string;
}

interface ReplyState {
    commentId: string;
    username: string;
}

export function CommentSheet({ isOpen, onClose, handle, memeId }: CommentSheetProps) {
    const [inputValue, setInputValue] = useState('');
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [replyTo, setReplyTo] = useState<ReplyState | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Current user
    const user = useAuthStore((s) => s.user);

    // Fetch comments
    const { data, isLoading, refetch } = useComments(memeId);
    const comments = data?.pages.flatMap((page) => page.comments) ?? [];

    // Mutations
    const createComment = useCreateComment();
    const toggleLike = useToggleLikeComment();

    // Focus input when reply mode activated
    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyTo]);

    const handleReply = (commentId: string, username: string) => {
        setReplyTo({ commentId, username });
        setInputValue(`@${username} `);
    };

    const cancelReply = () => {
        setReplyTo(null);
        setInputValue('');
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const handleLike = (commentId: string) => {
        toggleLike.mutate({ commentId, memeId });
    };

    const handleSubmit = () => {
        const content = inputValue.trim();
        if (!content || !memeId || createComment.isPending) return;

        const data = replyTo
            ? { content, parentCommentId: replyTo.commentId }
            : { content };

        createComment.mutate(
            { memeId, data },
            {
                onSuccess: () => {
                    setInputValue('');
                    if (replyTo) {
                        setExpandedReplies((prev) => new Set(prev).add(replyTo.commentId));
                        setReplyTo(null);
                    }
                    refetch();
                },
            }
        );
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
        }
        if (e.key === 'Escape' && replyTo) {
            cancelReply();
        }
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 1) return 'now';
        if (diffHours < 24) return `${diffHours}h`;
        return `${Math.floor(diffHours / 24)}d`;
    };

    // Render content with @mention highlighting
    const renderContent = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="mention">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div
            className={`sheet-overlay comment-sheet ${isOpen ? 'open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="sheet">
                {/* Header */}
                <header className="sheet-header">
                    <h3 className="sheet-title">
                        <span className="count">{comments.length}</span> comments{' '}
                        <span className="handle">{handle}</span>
                    </h3>
                    <button className="sheet-close" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </header>

                {/* Comments List */}
                <div className="comment-body">
                    {isLoading && <p className="comment-loading">Loading comments...</p>}

                    {!isLoading && comments.length === 0 && (
                        <p className="comment-empty">No comments yet. Be the first!</p>
                    )}

                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                <img src={comment.user.profilePicture || avatarDefault} alt="" />
                            </div>
                            <div className="comment-content">
                                <div className="comment-name">
                                    {comment.user.displayName || comment.user.username}
                                </div>
                                <div className="comment-text">
                                    {renderContent(comment.content)}
                                </div>
                                <div className="comment-meta">
                                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                    <button
                                        className="comment-action"
                                        onClick={() => handleReply(comment.id, comment.user.username)}
                                    >
                                        Reply
                                    </button>
                                    {comment.likeCount > 0 && (
                                        <button
                                            className={`comment-action comment-like ${comment.hasLiked ? 'active' : ''}`}
                                            onClick={() => handleLike(comment.id)}
                                        >
                                            <img
                                                src={comment.hasLiked ? iconHeartActive : iconHeartDefault}
                                                alt=""
                                            />
                                            <span>{comment.likeCount}</span>
                                        </button>
                                    )}
                                </div>

                                {/* View replies button */}
                                {comment.replyCount > 0 && !expandedReplies.has(comment.id) && (
                                    <button
                                        className="comment-toggle"
                                        onClick={() => toggleReplies(comment.id)}
                                    >
                                        View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                    </button>
                                )}

                                {/* Replies list */}
                                {expandedReplies.has(comment.id) && (
                                    <RepliesList
                                        parentCommentId={comment.id}
                                        memeId={memeId}
                                        formatTime={formatTime}
                                        renderContent={renderContent}
                                        onReply={handleReply}
                                        onHide={() => toggleReplies(comment.id)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply indicator */}
                {replyTo && (
                    <div className="comment-reply-indicator">
                        <span>Replying to @{replyTo.username}</span>
                        <button onClick={cancelReply}>Cancel</button>
                    </div>
                )}

                {/* Input */}
                <div className="comment-inputbar">
                    <div className="comment-avatar">
                        <img src={user?.profilePicture || avatarDefault} alt="" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={replyTo ? `Reply to @${replyTo.username}` : 'Add comment'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={createComment.isPending}
                    />
                    <button
                        className="comment-send"
                        onClick={handleSubmit}
                        disabled={createComment.isPending || !inputValue.trim()}
                    >
                        {createComment.isPending ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============ Replies List Component ============
interface RepliesListProps {
    parentCommentId: string;
    memeId: string;
    formatTime: (date: string) => string;
    renderContent: (content: string) => React.ReactNode;
    onReply: (commentId: string, username: string) => void;
    onHide: () => void;
}

function RepliesList({
    parentCommentId,
    // memeId,
    formatTime,
    renderContent,
    onReply,
    onHide
}: RepliesListProps) {
    const { data, isLoading, refetch } = useReplies(parentCommentId);
    const replies = data?.pages.flatMap((page) => page.comments) ?? [];

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return <div className="replies-loading">Loading replies...</div>;
    }

    return (
        <div className="replies-list">
            {replies.map((reply) => (
                <div key={reply.id} className="comment-item comment-reply">
                    <div className="comment-avatar">
                        <img src={reply.user.profilePicture || avatarDefault} alt="" />
                    </div>
                    <div className="comment-content">
                        <div className="comment-name">
                            {reply.user.displayName || reply.user.username}
                        </div>
                        <div className="comment-text">
                            {renderContent(reply.content)}
                        </div>
                        <div className="comment-meta">
                            <span className="comment-time">{formatTime(reply.createdAt)}</span>
                            <button
                                className="comment-action"
                                onClick={() => onReply(parentCommentId, reply.user.username)}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="comment-toggle" onClick={onHide}>
                Hide
            </button>
        </div>
    );
}