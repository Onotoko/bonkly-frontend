import { useState, useRef, useEffect, useCallback } from 'react';

// Icons
import iconClose from '@/assets/icons/icon-close.svg';

interface TextOverlay {
    id: string;
    text: string;
    x: number;
    y: number;
    font: FontType;
    style: StyleType;
    color: string;
    align: AlignType;
    fontSize: number;
}

type FontType = 'happy' | 'vintage' | 'excited' | 'bold';
type StyleType = 'text' | 'fill' | 'fill-round';
type AlignType = 'left' | 'center' | 'right';

interface TextEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (overlays: TextOverlay[]) => void;
    mediaUrl: string;
    mediaType: 'image' | 'video' | 'gif';
    initialOverlays?: TextOverlay[];
}

const FONTS: { key: FontType; label: string; fontFamily: string }[] = [
    { key: 'happy', label: 'Happy', fontFamily: "'Comic Sans MS', cursive" },
    { key: 'vintage', label: 'Vintage', fontFamily: "'Times New Roman', serif" },
    { key: 'excited', label: 'Excited', fontFamily: "'Impact', sans-serif" },
    { key: 'bold', label: 'Bold', fontFamily: "'Arial Black', sans-serif" },
];

const STYLES: { key: StyleType; label: string }[] = [
    { key: 'text', label: 'Text' },
    { key: 'fill', label: 'Fill' },
    { key: 'fill-round', label: 'Fill Round' },
];

const COLORS = [
    '#FE0405', '#FFD600', '#FF9800', '#4BD800',
    '#9C27B0', '#1F1F1F', '#FF80AB',
];

export function TextEditorModal({
    isOpen,
    onClose,
    onSave,
    mediaUrl,
    mediaType,
    initialOverlays = [],
}: TextEditorModalProps) {
    const [overlays, setOverlays] = useState<TextOverlay[]>(initialOverlays);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'font' | 'style' | 'color' | 'align'>('font');
    const [isEditing, setIsEditing] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, overlayX: 0, overlayY: 0 });

    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOverlay = overlays.find(o => o.id === selectedId);

    // Focus input when editing
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Get position relative to media
    const getRelativePosition = useCallback((clientX: number, clientY: number) => {
        if (!mediaContainerRef.current) return { x: 50, y: 50 };
        const rect = mediaContainerRef.current.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        x = Math.max(10, Math.min(90, x));
        y = Math.max(10, Math.min(90, y));
        return { x, y };
    }, []);

    // Handle tap on media - create text
    const handleMediaClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.text-overlay')) return;

        const { x, y } = getRelativePosition(e.clientX, e.clientY);

        const newOverlay: TextOverlay = {
            id: `text-${Date.now()}`,
            text: 'My Text',
            x,
            y,
            font: 'happy',
            style: 'text',
            color: '#FFFFFF',
            align: 'center',
            fontSize: 32,
        };
        setOverlays(prev => [...prev, newOverlay]);
        setSelectedId(newOverlay.id);
        setIsEditing(true);
    }, [getRelativePosition]);

    // Handle text overlay click
    const handleOverlayClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedId(id);
        setIsEditing(true);
    };

    // ============ DRAG HANDLERS ============
    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation();

        const overlay = overlays.find(o => o.id === id);
        if (!overlay) return;

        setSelectedId(id);
        setIsDragging(true);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragStart({
            x: clientX,
            y: clientY,
            overlayX: overlay.x,
            overlayY: overlay.y,
        });
    }, [overlays]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !selectedId || !mediaContainerRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const rect = mediaContainerRef.current.getBoundingClientRect();

        const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

        let newX = dragStart.overlayX + deltaX;
        let newY = dragStart.overlayY + deltaY;

        newX = Math.max(10, Math.min(90, newX));
        newY = Math.max(10, Math.min(90, newY));

        setOverlays(prev =>
            prev.map(o => o.id === selectedId ? { ...o, x: newX, y: newY } : o)
        );
    }, [isDragging, selectedId, dragStart]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Global drag listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove as EventListener);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove as EventListener);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // ============ HANDLERS ============
    const handleTextChange = (text: string) => {
        if (!selectedId) return;
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, text } : o))
        );
    };

    const handleFontChange = (font: FontType) => {
        if (!selectedId) return;
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, font } : o))
        );
    };

    const handleStyleChange = (style: StyleType) => {
        if (!selectedId) return;
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, style } : o))
        );
    };

    const handleColorChange = (color: string) => {
        if (!selectedId) return;
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, color } : o))
        );
    };

    const handleAlignChange = (align: AlignType) => {
        if (!selectedId) return;
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, align } : o))
        );
    };

    const handleInputBlur = () => {
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
        }
    };

    const handleDone = () => {
        onSave(overlays);
        onClose();
    };

    const getOverlayStyle = (overlay: TextOverlay): React.CSSProperties => {
        const fontConfig = FONTS.find(f => f.key === overlay.font);

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: 'translate(-50%, -50%)',
            fontFamily: fontConfig?.fontFamily || 'sans-serif',
            fontSize: `${overlay.fontSize}px`,
            color: overlay.color,
            textAlign: overlay.align,
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            touchAction: 'none',
        };

        if (overlay.style === 'fill') {
            return {
                ...baseStyle,
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '8px 16px',
                borderRadius: '4px',
            };
        }

        if (overlay.style === 'fill-round') {
            const isLightColor = overlay.color === '#FFFFFF' || overlay.color === '#FFD600';
            return {
                ...baseStyle,
                backgroundColor: overlay.color,
                padding: '12px 28px',
                borderRadius: '999px',
                color: isLightColor ? '#1F1F1F' : '#FFFFFF',
            };
        }

        return {
            ...baseStyle,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
        };
    };

    if (!isOpen) return null;

    return (
        <div className="text-editor-modal">
            {/* Header */}
            <header className="text-editor-header">
                <button className="text-editor-done" onClick={handleDone}>
                    Done
                </button>
                <div className="text-editor-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'font' ? 'active' : ''}`}
                        onClick={() => setActiveTab('font')}
                    >
                        Aa
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`}
                        onClick={() => setActiveTab('style')}
                    >
                        <span className="tab-icon-box">A</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                        onClick={() => setActiveTab('color')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" />
                        </svg>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'align' ? 'active' : ''}`}
                        onClick={() => setActiveTab('align')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
                        </svg>
                    </button>
                </div>
                <button className="icon-button" onClick={onClose}>
                    <img src={iconClose} alt="Close" />
                </button>
            </header>

            {/* Canvas Area */}
            <div className="text-editor-canvas">
                <div
                    className="text-editor-media-container"
                    ref={mediaContainerRef}
                    onClick={handleMediaClick}
                >
                    {mediaType === 'video' ? (
                        <video src={mediaUrl} className="canvas-media" />
                    ) : (
                        <img src={mediaUrl} alt="Edit" className="canvas-media" />
                    )}

                    {/* Text Overlays */}
                    <div className="text-overlays-layer">
                        {overlays.map(overlay => (
                            <div
                                key={overlay.id}
                                className={`text-overlay ${selectedId === overlay.id ? 'selected' : ''}`}
                                style={getOverlayStyle(overlay)}
                                onClick={(e) => handleOverlayClick(e, overlay.id)}
                                onMouseDown={(e) => handleDragStart(e, overlay.id)}
                                onTouchStart={(e) => handleDragStart(e, overlay.id)}
                            >
                                {selectedId === overlay.id && isEditing ? (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="text-overlay-input"
                                        value={overlay.text}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleInputKeyDown}
                                        style={{
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            color: 'inherit',
                                            textAlign: 'inherit',
                                        }}
                                    />
                                ) : (
                                    overlay.text
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Options Panel */}
            <div className="text-editor-options">
                {activeTab === 'font' && (
                    <div className="options-row">
                        <span className="options-label">Font</span>
                        <span className="options-divider">|</span>
                        <div className="options-list font-list">
                            {FONTS.map(font => (
                                <button
                                    key={font.key}
                                    className={`font-btn ${selectedOverlay?.font === font.key ? 'active' : ''}`}
                                    onClick={() => handleFontChange(font.key)}
                                    style={{ fontFamily: font.fontFamily }}
                                >
                                    {font.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'style' && (
                    <div className="options-row">
                        <span className="options-label">Style</span>
                        <span className="options-divider">|</span>
                        <div className="options-list">
                            {STYLES.map(style => (
                                <button
                                    key={style.key}
                                    className={`style-btn ${selectedOverlay?.style === style.key ? 'active' : ''}`}
                                    onClick={() => handleStyleChange(style.key)}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'color' && (
                    <div className="options-row">
                        <span className="options-label">Color</span>
                        <span className="options-divider">|</span>
                        <div className="color-list">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`color-btn ${selectedOverlay?.color === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(color)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'align' && (
                    <div className="options-row">
                        <span className="options-label">Align</span>
                        <span className="options-divider">|</span>
                        <div className="align-list">
                            <button
                                className={`align-btn ${selectedOverlay?.align === 'left' ? 'active' : ''}`}
                                onClick={() => handleAlignChange('left')}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 3h18v2H3V3zm0 4h10v2H3V7zm0 4h18v2H3v-2zm0 4h10v2H3v-2zm0 4h18v2H3v-2z" />
                                </svg>
                            </button>
                            <button
                                className={`align-btn ${selectedOverlay?.align === 'center' ? 'active' : ''}`}
                                onClick={() => handleAlignChange('center')}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 3h18v2H3V3zm4 4h10v2H7V7zm-4 4h18v2H3v-2zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z" />
                                </svg>
                            </button>
                            <button
                                className={`align-btn ${selectedOverlay?.align === 'right' ? 'active' : ''}`}
                                onClick={() => handleAlignChange('right')}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 3h18v2H3V3zm8 4h10v2H11V7zm-8 4h18v2H3v-2zm8 4h10v2H11v-2zm-8 4h18v2H3v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export type { TextOverlay };