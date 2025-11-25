import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { Button, IconButton } from './Button';

// ============================================
// Modal Component
// ============================================
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'full';
    className?: string;
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    closeOnOverlayClick = true,
    size = 'md',
    className,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            <div
                className={cn(
                    'relative w-full bg-white rounded-2xl shadow-xl',
                    'animate-in fade-in zoom-in-95 duration-200',
                    sizeStyles[size],
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                        {title && (
                            <h2 className="text-lg font-semibold text-[#22272E] font-heading">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                aria-label="Close modal"
                                className="ml-auto -mr-2"
                            >
                                <X className="w-5 h-5" />
                            </IconButton>
                        )}
                    </div>
                )}

                <div className="px-6 py-4">{children}</div>
            </div>
        </div>,
        document.body
    );
}

// ============================================
// BottomSheet Component
// ============================================
export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
    showHandle?: boolean;
    height?: 'auto' | 'half' | 'full';
    className?: string;
}

const heightStyles = {
    auto: 'max-h-[90vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
};

export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    showHandle = true,
    height = 'auto',
    className,
}: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            <div
                ref={sheetRef}
                className={cn(
                    'absolute bottom-0 left-0 right-0',
                    'bg-white rounded-t-3xl shadow-xl',
                    'animate-in slide-in-from-bottom duration-300',
                    'safe-bottom',
                    heightStyles[height],
                    className
                )}
            >
                {showHandle && (
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
                    </div>
                )}

                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-3">
                        {title && (
                            <h2 className="text-lg font-semibold text-[#22272E] font-heading">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                aria-label="Close"
                                className="ml-auto -mr-2"
                            >
                                <X className="w-5 h-5" />
                            </IconButton>
                        )}
                    </div>
                )}

                <div className={cn('px-6 pb-6 overflow-y-auto', !title && 'pt-2')}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ============================================
// Confirm Dialog
// ============================================
export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-[#6B7280] mb-6">{message}</p>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                >
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}