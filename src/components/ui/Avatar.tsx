import { useState } from 'react';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: AvatarSize;
    className?: string;
    fallback?: string; // Initials or text
}

const sizeStyles: Record<AvatarSize, { container: string; icon: string; text: string }> = {
    xs: { container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' },
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { container: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' },
    lg: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg' },
    xl: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-xl' },
    '2xl': { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-2xl' },
};

export function Avatar({ src, alt, size = 'md', className, fallback }: AvatarProps) {
    const [hasError, setHasError] = useState(false);
    const styles = sizeStyles[size];

    const showFallback = !src || hasError;

    // Generate initials from fallback or alt
    const initials = (fallback || alt || '')
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={cn(
                'relative flex items-center justify-center',
                'rounded-full overflow-hidden',
                'bg-[#E5E7EB]',
                styles.container,
                className
            )}
        >
            {showFallback ? (
                initials ? (
                    <span className={cn('font-semibold text-[#6B7280]', styles.text)}>
                        {initials}
                    </span>
                ) : (
                    <User className={cn('text-[#9CA3AF]', styles.icon)} />
                )
            ) : (
                <img
                    src={src}
                    alt={alt || 'Avatar'}
                    onError={() => setHasError(true)}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
}
// ============================================
// Avatar Group (for showing multiple avatars)
// ============================================
export interface AvatarGroupProps {
    avatars: Array<{ src?: string; alt?: string }>;
    max?: number;
    size?: AvatarSize;
    className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
        <div className={cn('flex -space-x-2', className)}>
            {visibleAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    alt={avatar.alt}
                    size={size}
                    className="ring-2 ring-white"
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'rounded-full bg-[#F3F4F6] ring-2 ring-white',
                        'text-xs font-medium text-[#6B7280]',
                        sizeStyles[size].container
                    )}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}

