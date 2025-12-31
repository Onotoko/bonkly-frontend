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
    '#FE0405', // Red
    '#FFD600', // Yellow
    '#4BD800', // Green
    '#9C27B0', // Purple
    '#1F1F1F', // Black
    '#FF80AB', // Pink
    '#2196F3', // Blue
    '#FFFFFF', // White
];

const ALIGNS: { key: AlignType; label: string }[] = [
    { key: 'left', label: 'Left' },
    { key: 'center', label: 'Center' },
    { key: 'right', label: 'Right' },
];

export function TextEditorModal({
    isOpen,
    onClose,
    onSave,
    mediaUrl,
    mediaType,
    initialOverlays = [],
}: TextEditorModalProps) {
    // Initialize state directly from props (component remounts on each open due to key)
    const [overlays, setOverlays] = useState<TextOverlay[]>(initialOverlays);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'font' | 'style' | 'color' | 'align'>('font');
    const [isEditing, setIsEditing] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

    const selectedOverlay = overlays.find(o => o.id === selectedId);

    // Focus input when editing
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Get click position relative to canvas (full screen)
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Calculate position relative to canvas (0-100%)
        const x = ((clickX - canvasRect.left) / canvasRect.width) * 100;
        const y = ((clickY - canvasRect.top) / canvasRect.height) * 100;

        // If clicking on canvas area (not on existing text), add new text
        const target = e.target as HTMLElement;
        if (
            target === canvasRef.current ||
            target.classList.contains('canvas-media') ||
            target.classList.contains('text-editor-media-container') ||
            target.classList.contains('text-overlays-layer')
        ) {
            const newOverlay: TextOverlay = {
                id: `text-${Date.now()}`,
                text: 'My Text',
                x: Math.max(5, Math.min(95, x)),
                y: Math.max(5, Math.min(95, y)),
                font: 'happy',
                style: 'text',
                color: '#FFFFFF',
                align: 'center',
                fontSize: 24,
            };
            setOverlays(prev => [...prev, newOverlay]);
            setSelectedId(newOverlay.id);
            setIsEditing(true);
        }
    }, []);

    const handleOverlayClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedId(id);
        setIsEditing(true);
    };

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
        if (!selectedId) {
            console.log('No text selected for align change');
            return;
        }
        console.log('Changing align to:', align, 'for overlay:', selectedId);
        setOverlays(prev =>
            prev.map(o => (o.id === selectedId ? { ...o, align } : o))
        );
    };

    const handleDeleteSelected = () => {
        if (!selectedId) return;
        setOverlays(prev => prev.filter(o => o.id !== selectedId));
        setSelectedId(null);
        setIsEditing(false);
    };

    const handleDone = () => {
        console.log('Saving overlays:', overlays); // Debug log
        onSave(overlays);
        onClose();
    };

    const getOverlayStyle = (overlay: TextOverlay): React.CSSProperties => {
        const fontConfig = FONTS.find(f => f.key === overlay.font);

        // Calculate transform based on alignment
        let translateX = '-50%'; // center by default
        if (overlay.align === 'left') translateX = '0%';
        if (overlay.align === 'right') translateX = '-100%';

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: `translate(${translateX}, -50%)`,
            fontFamily: fontConfig?.fontFamily || 'sans-serif',
            fontSize: `${overlay.fontSize}px`,
            color: overlay.color,
            textAlign: overlay.align,
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
        };

        if (overlay.style === 'fill') {
            return {
                ...baseStyle,
                backgroundColor: overlay.color === '#FFFFFF' ? '#1F1F1F' : 'rgba(0,0,0,0.7)',
                padding: '8px 16px',
                color: overlay.color,
            };
        }

        if (overlay.style === 'fill-round') {
            return {
                ...baseStyle,
                backgroundColor: overlay.color,
                padding: '8px 20px',
                borderRadius: '999px',
                color: overlay.color === '#FFFFFF' || overlay.color === '#FFD600' ? '#1F1F1F' : '#FFFFFF',
            };
        }

        // Text style - add text shadow for visibility
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
                        </svg>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                        onClick={() => setActiveTab('color')}
                    >
                        <span className="color-dot" style={{ background: selectedOverlay?.color || '#FE0405' }} />
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'align' ? 'active' : ''}`}
                        onClick={() => setActiveTab('align')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h18v2H3V3zm0 8h12v2H3v-2zm0 8h18v2H3v-2zm0-4h12v2H3v-2zm0-8h18v2H3V7z" />
                        </svg>
                    </button>
                </div>
                <button className="icon-button" onClick={onClose}>
                    <img src={iconClose} alt="Close" />
                </button>
            </header>

            {/* Canvas Area */}
            <div className="text-editor-canvas" ref={canvasRef} onClick={handleCanvasClick}>
                <div className="text-editor-media-container">
                    {mediaType === 'video' ? (
                        <video src={mediaUrl} className="canvas-media" />
                    ) : (
                        <img src={mediaUrl} alt="Edit" className="canvas-media" />
                    )}

                    {/* Text Overlays Layer */}
                    <div className="text-overlays-layer">
                        {overlays.map(overlay => (
                            <div
                                key={overlay.id}
                                className={`text-overlay ${selectedId === overlay.id ? 'selected' : ''}`}
                                style={getOverlayStyle(overlay)}
                                onClick={(e) => handleOverlayClick(e, overlay.id)}
                            >
                                {overlay.text}
                                {selectedId === overlay.id && (
                                    <button
                                        className="delete-overlay"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSelected();
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {overlays.length === 0 && (
                    <div className="canvas-hint">Tap on image to add text</div>
                )}
            </div>

            {/* Options Panel */}
            <div className="text-editor-options">
                {activeTab === 'font' && (
                    <div className="options-row font-options">
                        <span className="options-label">Font</span>
                        <div className="options-list">
                            {FONTS.map(font => (
                                <button
                                    key={font.key}
                                    className={`option-btn ${selectedOverlay?.font === font.key ? 'active' : ''}`}
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
                    <div className="options-row style-options">
                        <span className="options-label">Style</span>
                        <div className="options-list">
                            {STYLES.map(style => (
                                <button
                                    key={style.key}
                                    className={`option-btn ${selectedOverlay?.style === style.key ? 'active' : ''}`}
                                    onClick={() => handleStyleChange(style.key)}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'color' && (
                    <div className="options-row color-options">
                        <span className="options-label">Color</span>
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
                    <div className="options-row align-options">
                        <span className="options-label">Align</span>
                        <div className="options-list">
                            {ALIGNS.map(align => (
                                <button
                                    key={align.key}
                                    className={`option-btn ${selectedOverlay?.align === align.key ? 'active' : ''}`}
                                    onClick={() => handleAlignChange(align.key)}
                                >
                                    {align.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Text Input (when editing) */}
            {isEditing && selectedId && (
                <div className="text-input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        className="text-input"
                        value={selectedOverlay?.text || ''}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        placeholder="Enter text..."
                    />
                </div>
            )}
        </div>
    );
}

export type { TextOverlay };