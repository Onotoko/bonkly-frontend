import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

// ============================================
// Badge Component
// ============================================
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface BadgeProps {
    variant?: BadgeVariant;
    children: ReactNode;
    className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
    default: 'bg-[#F3F4F6] text-[#6B7280]',
    primary: 'bg-[#FF0000]/10 text-[#FF0000]',
    secondary: 'bg-[#4CAF50]/10 text-[#4CAF50]',
    success: 'bg-[#10B981]/10 text-[#10B981]',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    error: 'bg-[#EF4444]/10 text-[#EF4444]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5',
                'text-xs font-medium rounded-full',
                badgeVariants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

// ============================================
// Tag Badge (for hashtags)
// ============================================
export interface TagProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

export function Tag({ children, onClick, className }: TagProps) {
    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            onClick={onClick}
            className={cn(
                'inline-flex items-center',
                'text-sm font-medium text-[#FF0000]',
                onClick && 'hover:underline cursor-pointer',
                className
            )}
        >
            #{children}
        </Component>
    );
}