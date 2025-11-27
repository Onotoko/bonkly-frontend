import { Heart, Laugh, MessageCircle, Share2 } from 'lucide-react';
import { Avatar } from '@/components/ui';
import type { Meme } from '@/types/api';

interface MemeCardProps {
    meme: Meme;
    onClick?: () => void;
}

function formatCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(0)}k`;
    return count.toString();
}

function formatTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
}

export default function MemeCard({ meme, onClick }: MemeCardProps) {
    const handleLove = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement love action
    };

    const handleLaugh = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Open laugh modal
    };

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Navigate to comments
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Open share sheet
    };

    return (
        <article
            onClick={onClick}
            className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
        >
            {/* Header - User info */}
            <div className="flex items-center gap-3 px-4 py-3">
                <Avatar
                    src={meme.creator.avatarUrl}
                    alt={meme.creator.displayName}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {meme.creator.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                        @{meme.creator.username} · {formatTimeAgo(meme.createdAt)}
                    </p>
                </div>
            </div>

            {/* Meme Image */}
            <div className="relative aspect-square w-full bg-gray-100">
                <img
                    src={meme.mediaUrl}
                    alt={meme.description || 'Meme'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Description & Tags */}
            {(meme.description || meme.tags?.length > 0) && (
                <div className="px-4 pt-3">
                    {meme.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {meme.description}
                        </p>
                    )}
                    {meme.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {meme.tags.map((tag) => (
                                <span key={tag} className="text-xs text-[#E53935]">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats & Actions */}
            <div className="flex items-center justify-between px-4 py-3">
                {/* dBONK earned */}
                <div className="text-xs font-medium text-gray-500">
                    {formatCount(meme.totalRewards || 0)} dBonk
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                    {/* Love */}
                    <button
                        onClick={handleLove}
                        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-[#E53935]"
                    >
                        <Heart
                            className={`h-5 w-5 ${meme.isLoved ? 'fill-[#E53935] text-[#E53935]' : ''}`}
                        />
                        <span className="text-xs font-medium">
                            {formatCount(meme.loveCount || 0)}
                        </span>
                    </button>

                    {/* Laugh */}
                    <button
                        onClick={handleLaugh}
                        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-[#FFC107]"
                    >
                        <Laugh
                            className={`h-5 w-5 ${meme.isLaughed ? 'fill-[#FFC107] text-[#FFC107]' : ''}`}
                        />
                        <span className="text-xs font-medium">
                            {formatCount(meme.laughCount || 0)}
                        </span>
                    </button>

                    {/* Comments */}
                    <button
                        onClick={handleComment}
                        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-700"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-xs font-medium">
                            {formatCount(meme.commentCount || 0)}
                        </span>
                    </button>

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="text-gray-500 transition-colors hover:text-gray-700"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </article>
    );
}