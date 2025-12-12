import { useState } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';

// Images
import avatarDefault from '@/assets/images/avatar-default.png';

interface Comment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
    replies?: Comment[];
}

interface CommentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    handle: string;
    comments: Comment[];
    onSubmit: (text: string) => void;
}

// Mock data
const MOCK_COMMENTS: Comment[] = [
    {
        id: '1',
        author: 'Abram',
        avatar: avatarDefault,
        text: 'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups....',
        time: '12h',
    },
    {
        id: '2',
        author: 'Linken',
        avatar: avatarDefault,
        text: 'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups....',
        time: '12h',
        replies: [
            {
                id: '2-1',
                author: 'Udin',
                avatar: avatarDefault,
                text: 'Lorem ipsum is placeholder text commonly used in the graphic',
                time: '12h',
            },
            {
                id: '2-2',
                author: 'Sarah',
                avatar: avatarDefault,
                text: '@udin Lorem ipsum is placeholder text commonly used in the graphic',
                time: '12h',
            },
        ],
    },
    {
        id: '3',
        author: 'Abram',
        avatar: avatarDefault,
        text: 'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups....',
        time: '12h',
    },
];

export function CommentSheet({ isOpen, onClose, handle, onSubmit }: CommentSheetProps) {
    const [inputValue, setInputValue] = useState('');
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

    const comments = MOCK_COMMENTS; // TODO: Use prop

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

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue.trim());
            setInputValue('');
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
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
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                <img src={comment.avatar} alt="" />
                            </div>
                            <div className="comment-content">
                                <div className="comment-name">{comment.author}</div>
                                <div className="comment-text">{comment.text}</div>
                                <div className="comment-meta">
                                    <span>{comment.time}</span>
                                    <button className="comment-action">Reply</button>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <>
                                        <div
                                            className={`comment-thread ${expandedReplies.has(comment.id) ? '' : 'hidden'
                                                }`}
                                        >
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="comment-item">
                                                    <div className="comment-avatar">
                                                        <img src={reply.avatar} alt="" />
                                                    </div>
                                                    <div className="comment-content">
                                                        <div className="comment-name">{reply.author}</div>
                                                        <div className="comment-text">
                                                            {reply.text.includes('@') ? (
                                                                <>
                                                                    <span className="mention">
                                                                        {reply.text.split(' ')[0]}
                                                                    </span>{' '}
                                                                    {reply.text.split(' ').slice(1).join(' ')}
                                                                </>
                                                            ) : (
                                                                reply.text
                                                            )}
                                                        </div>
                                                        <div className="comment-meta">
                                                            <span>{reply.time}</span>
                                                            <button className="comment-action">Reply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            className="comment-toggle"
                                            onClick={() => toggleReplies(comment.id)}
                                        >
                                            {expandedReplies.has(comment.id)
                                                ? 'Hide'
                                                : `View ${comment.replies.length} reply`}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="comment-inputbar">
                    <div className="comment-avatar">
                        <img src={avatarDefault} alt="" />
                    </div>
                    <input
                        type="text"
                        placeholder="Add comment"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="comment-send" onClick={handleSubmit}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}