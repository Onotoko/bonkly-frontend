import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-[#FF0000] text-white 
    hover:bg-[#CC0000] 
    active:bg-[#990000]
    disabled:bg-[#FFAAAA] disabled:text-white
  `,
    secondary: `
    bg-[#4CAF50] text-white 
    hover:bg-[#43A047] 
    active:bg-[#388E3C]
    disabled:bg-[#A5D6A7] disabled:text-white
  `,
    outline: `
    bg-white text-[#22272E] border-2 border-[#D1D5DB]
    hover:bg-[#F3F4F6] hover:border-[#9CA3AF]
    active:bg-[#E5E7EB]
    disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB]
  `,
    ghost: `
    bg-transparent text-[#22272E]
    hover:bg-[#F3F4F6]
    active:bg-[#E5E7EB]
    disabled:text-[#9CA3AF]
  `,
    danger: `
    bg-[#EF4444] text-white
    hover:bg-[#DC2626]
    active:bg-[#B91C1C]
    disabled:bg-[#FCA5A5] disabled:text-white
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-12 px-6 text-base gap-2',
    lg: 'h-14 px-8 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center',
                    'font-semibold rounded-full',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF0000]',
                    'disabled:cursor-not-allowed',
                    // Variant & Size
                    variantStyles[variant],
                    sizeStyles[size],
                    // Full width
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        <span>{children}</span>
                        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// ============================================
// Icon Button variant
// ============================================
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    'aria-label': string;
    children: ReactNode;
}

const iconSizeStyles: Record<ButtonSize, string> = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            variant = 'ghost',
            size = 'md',
            isLoading = false,
            disabled,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-full',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF0000]',
                    'disabled:cursor-not-allowed',
                    variantStyles[variant],
                    iconSizeStyles[size],
                    className
                )}
                {...props}
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';