// src/components/ui/Tabs.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

// ============================================
// Tabs Context
// ============================================
interface TabsContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
}

// ============================================
// Tabs Root
// ============================================
export interface TabsProps {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
}

export function Tabs({
    defaultValue,
    value,
    onValueChange,
    children,
    className,
}: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const activeTab = value ?? internalValue;

    const setActiveTab = (tab: string) => {
        setInternalValue(tab);
        onValueChange?.(tab);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

// ============================================
// Tabs List (Pill style)
// ============================================
export interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 p-1',
                'bg-[#F3F4F6] rounded-full',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

// ============================================
// Tab Trigger (Button)
// ============================================
export interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}

export function TabsTrigger({
    value,
    children,
    className,
    disabled,
}: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => setActiveTab(value)}
            className={cn(
                'px-4 py-2 text-sm font-medium rounded-full',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]',
                isActive
                    ? 'bg-[#FF0000] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#22272E]',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {children}
        </button>
    );
}

// ============================================
// Tab Content
// ============================================
export interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) return null;

    return (
        <div role="tabpanel" className={className}>
            {children}
        </div>
    );
}