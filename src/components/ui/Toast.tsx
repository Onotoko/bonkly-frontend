import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ============================================
// Types
// ============================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

// ============================================
// Toast Icons & Styles
// ============================================
const toastIcons: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-[#10B981]" />,
    error: <XCircle className="w-5 h-5 text-[#EF4444]" />,
    warning: <AlertCircle className="w-5 h-5 text-[#F59E0B]" />,
    info: <Info className="w-5 h-5 text-[#3B82F6]" />,
};

const toastStyles: Record<ToastType, string> = {
    success: 'border-l-[#10B981]',
    error: 'border-l-[#EF4444]',
    warning: 'border-l-[#F59E0B]',
    info: 'border-l-[#3B82F6]',
};

// ============================================
// Toast Item
// ============================================
interface ToastItemProps extends ToastData {
    onClose: (id: string) => void;
}

function ToastItem({ id, type, title, message, duration = 5000, onClose }: ToastItemProps) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4',
                'bg-white rounded-lg shadow-lg border-l-4',
                'animate-in slide-in-from-right duration-300',
                toastStyles[type]
            )}
        >
            <div className="flex-shrink-0 mt-0.5">{toastIcons[type]}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[#22272E]">{title}</p>
                {message && <p className="mt-1 text-sm text-[#6B7280]">{message}</p>}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ============================================
// Toast Container
// ============================================
interface ToastContainerProps {
    toasts: ToastData[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} {...toast} onClose={onClose} />
            ))}
        </div>,
        document.body
    );
}