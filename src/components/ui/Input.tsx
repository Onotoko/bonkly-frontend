// src/components/ui/Input.tsx
import {
    forwardRef,
    useState,
    useRef,
    type InputHTMLAttributes,
    type TextareaHTMLAttributes,
    type ReactNode,
    type KeyboardEvent,
    type ClipboardEvent,
} from 'react';
import { cn } from '@/utils/cn';

// ============================================
// Input Component
// ============================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            rightElement,
            className,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || props.name;
        const hasError = !!error;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[#22272E] mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            'w-full h-12 px-4',
                            'bg-white border-2 rounded-xl',
                            'text-[#22272E] text-base font-normal',
                            'placeholder:text-[#9CA3AF]',
                            'transition-all duration-200',
                            'focus:outline-none focus:border-[#FF0000] focus:ring-2 focus:ring-[#FF0000]/20',
                            'disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed',
                            hasError
                                ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                : 'border-[#D1D5DB]',
                            leftIcon && 'pl-12',
                            (rightIcon || rightElement) && 'pr-12',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                            {rightIcon}
                        </div>
                    )}

                    {rightElement && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {rightElement}
                        </div>
                    )}
                </div>

                {(error || hint) && (
                    <p
                        className={cn(
                            'mt-1.5 text-sm',
                            hasError ? 'text-[#EF4444]' : 'text-[#6B7280]'
                        )}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ============================================
// Textarea Component
// ============================================
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className, disabled, id, ...props }, ref) => {
        const inputId = id || props.name;
        const hasError = !!error;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[#22272E] mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    className={cn(
                        'w-full min-h-[120px] px-4 py-3',
                        'bg-white border-2 rounded-xl',
                        'text-[#22272E] text-base font-normal',
                        'placeholder:text-[#9CA3AF]',
                        'transition-all duration-200',
                        'resize-none',
                        'focus:outline-none focus:border-[#FF0000] focus:ring-2 focus:ring-[#FF0000]/20',
                        'disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed',
                        hasError
                            ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                            : 'border-[#D1D5DB]',
                        className
                    )}
                    {...props}
                />

                {(error || hint) && (
                    <p
                        className={cn(
                            'mt-1.5 text-sm',
                            hasError ? 'text-[#EF4444]' : 'text-[#6B7280]'
                        )}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// ============================================
// OTP/Code Input (for Referral Code)
// ============================================
export interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function OTPInput({
    length = 6,
    value,
    onChange,
    error,
    disabled,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const valueArray = value.split('').slice(0, length);
    while (valueArray.length < length) {
        valueArray.push('');
    }

    const handleChange = (index: number, char: string) => {
        if (disabled) return;

        const newValue = valueArray.slice();
        newValue[index] = char.toUpperCase();
        onChange(newValue.join(''));

        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !valueArray[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, length);
        onChange(pastedData);
    };

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2">
                {valueArray.map((char, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={char}
                        disabled={disabled}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        className={cn(
                            'w-12 h-14 text-center text-xl font-bold',
                            'bg-[#F3F4F6] border-2 rounded-lg',
                            'text-[#22272E]',
                            'transition-all duration-200',
                            'focus:outline-none focus:border-[#FF0000] focus:bg-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-[#EF4444]' : 'border-transparent',
                            focusedIndex === index && 'border-[#FF0000] bg-white'
                        )}
                    />
                ))}
            </div>

            {error && (
                <p className="mt-2 text-sm text-[#EF4444] text-center">{error}</p>
            )}
        </div>
    );
}