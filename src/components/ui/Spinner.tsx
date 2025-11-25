import { cn } from '@/utils/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
    color?: string;
}

const spinnerSizes: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

export function Spinner({ size = 'md', className, color = '#FF0000' }: SpinnerProps) {
    return (
        <svg
            className={cn('animate-spin', spinnerSizes[size], className)}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill={color}
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

// ============================================
// Full Page Loader
// ============================================
export interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
            <Spinner size="lg" />
            <p className="mt-4 text-[#6B7280] font-medium">{message}</p>
        </div>
    );
}

// ============================================
// Skeleton Loader
// ============================================
export interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-[#E5E7EB]',
                variant === 'circular' && 'rounded-full',
                variant === 'text' && 'rounded h-4',
                variant === 'rectangular' && 'rounded-lg',
                className
            )}
            style={{ width, height }}
        />
    );
}