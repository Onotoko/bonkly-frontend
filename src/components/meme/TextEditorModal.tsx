import { useState, useRef, useEffect } from 'react';
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

const COLORS = ['#FE0405', '#FFD600', '#FF9800', '#4BD800', '#9C27B0', '#1F1F1F', '#FFFFFF'];

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
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, overlayX: 0, overlayY: 0 });
    const resizeStartRef = useRef({ y: 0, fontSize: 32 });

    const selectedOverlay = overlays.find(o => o.id === selectedId);

    // Focus input when editing
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing, selectedId]);

    const getRelativePosition = (clientX: number, clientY: number) => {
        if (!mediaContainerRef.current) return { x: 50, y: 50 };
        const rect = mediaContainerRef.current.getBoundingClientRect();
        const x = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));
        return { x, y };
    };

    // Create text on canvas click - only within image bounds
    const handleMediaClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.text-overlay')) return;

        // Only allow click on image itself
        const target = e.target as HTMLElement;
        if (!target.classList.contains('canvas-media')) {
            if (selectedId) {
                setSelectedId(null);
                setIsEditing(false);
            }
            return;
        }

        if (selectedId) {
            setSelectedId(null);
            setIsEditing(false);
            return;
        }

        const { x, y } = getRelativePosition(e.clientX, e.clientY);
        const newOverlay: TextOverlay = {
            id: `text-${Date.now()}`,
            text: 'My Text',
            x, y,
            font: 'happy',
            style: 'text',
            color: '#FFFFFF',
            align: 'center',
            fontSize: 32,
        };
        setOverlays(prev => [...prev, newOverlay]);
        setSelectedId(newOverlay.id);
        setIsEditing(true);
    };

    const handleOverlayClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!isDragging && !isResizing) {
            setSelectedId(id);
            setIsEditing(true);
        }
    };

    // ============ DRAG ============
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest('.resize-handle') ||
            (e.target as HTMLElement).closest('.delete-btn')) return;

        const overlay = overlays.find(o => o.id === id);
        if (!overlay) return;

        setSelectedId(id);
        setIsEditing(false);
        setIsDragging(true);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { x: clientX, y: clientY, overlayX: overlay.x, overlayY: overlay.y };

        const handleMove = (ev: MouseEvent | TouchEvent) => {
            const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
            const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
            const rect = mediaContainerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const dx = ((cx - dragStartRef.current.x) / rect.width) * 100;
            const dy = ((cy - dragStartRef.current.y) / rect.height) * 100;
            const newX = Math.max(10, Math.min(90, dragStartRef.current.overlayX + dx));
            const newY = Math.max(10, Math.min(90, dragStartRef.current.overlayY + dy));

            setOverlays(prev => prev.map(o => o.id === id ? { ...o, x: newX, y: newY } : o));
        };

        const handleEnd = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);
    };

    // ============ RESIZE ============
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!selectedId) return;
        const overlay = overlays.find(o => o.id === selectedId);
        if (!overlay) return;

        setIsResizing(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        resizeStartRef.current = { y: clientY, fontSize: overlay.fontSize };

        const handleMove = (ev: MouseEvent | TouchEvent) => {
            const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
            const delta = resizeStartRef.current.y - cy;
            const newSize = Math.max(16, Math.min(100, resizeStartRef.current.fontSize + delta * 0.5));
            setOverlays(prev => prev.map(o => o.id === selectedId ? { ...o, fontSize: Math.round(newSize) } : o));
        };

        const handleEnd = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);
    };

    // ============ DELETE ============
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedId) return;
        setOverlays(prev => prev.filter(o => o.id !== selectedId));
        setSelectedId(null);
        setIsEditing(false);
    };

    // ============ TEXT & STYLE ============
    const handleTextChange = (text: string) => {
        if (!selectedId) return;
        setOverlays(prev => prev.map(o => o.id === selectedId ? { ...o, text } : o));
    };

    const updateStyle = (key: keyof TextOverlay, value: string) => {
        if (!selectedId) return;
        setOverlays(prev => prev.map(o => o.id === selectedId ? { ...o, [key]: value } : o));
    };

    const handleInputBlur = () => setIsEditing(false);
    const handleInputKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') setIsEditing(false); };
    const handleDone = () => { onSave(overlays); onClose(); };

    const getOverlayStyle = (overlay: TextOverlay): React.CSSProperties => {
        const font = FONTS.find(f => f.key === overlay.font);
        const base: React.CSSProperties = {
            position: 'absolute',
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: 'translate(-50%, -50%)',
            fontFamily: font?.fontFamily,
            fontSize: overlay.fontSize,
            color: overlay.color,
            textAlign: overlay.align,
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            touchAction: 'none',
        };

        if (overlay.style === 'fill') return { ...base, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 4 };
        if (overlay.style === 'fill-round') {
            const light = overlay.color === '#FFFFFF' || overlay.color === '#FFD600';
            return { ...base, background: overlay.color, padding: '12px 28px', borderRadius: 999, color: light ? '#1F1F1F' : '#FFF' };
        }
        return { ...base, textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)' };
    };

    if (!isOpen) return null;

    return (
        <div className="text-editor-modal">
            <header className="text-editor-header">
                <button className="text-editor-done" onClick={handleDone}>Done</button>
                <div className="text-editor-tabs">
                    <button className={`tab-btn ${activeTab === 'font' ? 'active' : ''}`} onClick={() => setActiveTab('font')}>Aa</button>
                    <button className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`} onClick={() => setActiveTab('style')}><span className="tab-icon-box">A</span></button>
                    <button className={`tab-btn ${activeTab === 'color' ? 'active' : ''}`} onClick={() => setActiveTab('color')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z" /></svg>
                    </button>
                    <button className={`tab-btn ${activeTab === 'align' ? 'active' : ''}`} onClick={() => setActiveTab('align')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" /></svg>
                    </button>
                </div>
                <button className="icon-button" onClick={onClose}><img src={iconClose} alt="Close" /></button>
            </header>

            <div className="text-editor-canvas">
                <div className="text-editor-media-container" ref={mediaContainerRef} onClick={handleMediaClick}>
                    {mediaType === 'video' ? (
                        <video src={mediaUrl} className="canvas-media" />
                    ) : (
                        <img src={mediaUrl} alt="Edit" className="canvas-media" />
                    )}

                    <div className="text-overlays-layer">
                        {overlays.map(overlay => (
                            <div
                                key={overlay.id}
                                className={`text-overlay ${selectedId === overlay.id ? 'selected' : ''}`}
                                style={getOverlayStyle(overlay)}
                                onClick={e => handleOverlayClick(e, overlay.id)}
                                onMouseDown={e => handleDragStart(e, overlay.id)}
                                onTouchStart={e => handleDragStart(e, overlay.id)}
                            >
                                {selectedId === overlay.id && isEditing ? (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="text-overlay-input"
                                        value={overlay.text}
                                        onChange={e => handleTextChange(e.target.value)}
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleInputKeyDown}
                                        style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', textAlign: 'inherit' }}
                                    />
                                ) : overlay.text}

                                {selectedId === overlay.id && !isEditing && (
                                    <>
                                        <div className="selection-box">
                                            <div className="handle handle-tl" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-t" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-tr" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-l" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-r" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-bl" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-b" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                            <div className="handle handle-br" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} />
                                        </div>
                                        <button className="delete-btn" onClick={handleDelete}>×</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-editor-options">
                {activeTab === 'font' && (
                    <div className="options-row">
                        <span className="options-label">Font</span>
                        <span className="options-divider">|</span>
                        <div className="options-list font-list">
                            {FONTS.map(f => (
                                <button key={f.key} className={`font-btn ${selectedOverlay?.font === f.key ? 'active' : ''}`} style={{ fontFamily: f.fontFamily }} onClick={() => updateStyle('font', f.key)}>{f.label}</button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'style' && (
                    <div className="options-row">
                        <span className="options-label">Style</span>
                        <span className="options-divider">|</span>
                        <div className="options-list">
                            {STYLES.map(s => (
                                <button key={s.key} className={`style-btn ${selectedOverlay?.style === s.key ? 'active' : ''}`} onClick={() => updateStyle('style', s.key)}>{s.label}</button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'color' && (
                    <div className="options-row">
                        <span className="options-label">Color</span>
                        <span className="options-divider">|</span>
                        <div className="color-list">
                            {COLORS.map(c => (
                                <button key={c} className={`color-btn ${selectedOverlay?.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => updateStyle('color', c)} />
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'align' && (
                    <div className="options-row">
                        <span className="options-label">Align</span>
                        <span className="options-divider">|</span>
                        <div className="align-list">
                            {(['left', 'center', 'right'] as const).map(a => (
                                <button key={a} className={`align-btn ${selectedOverlay?.align === a ? 'active' : ''}`} onClick={() => updateStyle('align', a)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        {a === 'left' && <path d="M3 3h18v2H3V3zm0 4h10v2H3V7zm0 4h18v2H3v-2zm0 4h10v2H3v-2zm0 4h18v2H3v-2z" />}
                                        {a === 'center' && <path d="M3 3h18v2H3V3zm4 4h10v2H7V7zm-4 4h18v2H3v-2zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z" />}
                                        {a === 'right' && <path d="M3 3h18v2H3V3zm8 4h10v2H11V7zm-8 4h18v2H3v-2zm8 4h10v2H11v-2zm-8 4h18v2H3v-2z" />}
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export type { TextOverlay };