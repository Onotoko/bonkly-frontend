interface TextOverlay {
    id: string;
    text: string;
    x: number;
    y: number;
    font: 'happy' | 'vintage' | 'excited' | 'bold';
    style: 'text' | 'fill' | 'fill-round';
    color: string;
    align: 'left' | 'center' | 'right';
    fontSize: number;
}

const FONT_MAP: Record<string, string> = {
    happy: "'Comic Sans MS', cursive",
    vintage: "'Times New Roman', serif",
    excited: "'Impact', sans-serif",
    bold: "'Arial Black', sans-serif",
};

/**
 * Renders an image with text overlays burned in
 * Returns a Blob of the final image
 */
export async function renderMemeWithOverlays(
    imageUrl: string,
    overlays: TextOverlay[]
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Create canvas with image dimensions
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Draw each text overlay
            overlays.forEach(overlay => {
                const x = (overlay.x / 100) * canvas.width;
                const y = (overlay.y / 100) * canvas.height;

                // Scale font size relative to image size
                // Assuming preview was ~400px wide, scale proportionally
                const scaleFactor = canvas.width / 400;
                const fontSize = overlay.fontSize * scaleFactor;

                // Set font
                const fontFamily = FONT_MAP[overlay.font] || 'sans-serif';
                ctx.font = `bold ${fontSize}px ${fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Measure text for background
                const metrics = ctx.measureText(overlay.text);
                const textWidth = metrics.width;
                const textHeight = fontSize;
                const padding = fontSize * 0.4;

                if (overlay.style === 'fill') {
                    // Draw dark background
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(
                        x - textWidth / 2 - padding,
                        y - textHeight / 2 - padding / 2,
                        textWidth + padding * 2,
                        textHeight + padding
                    );
                    ctx.fillStyle = overlay.color;
                    ctx.fillText(overlay.text, x, y);

                } else if (overlay.style === 'fill-round') {
                    // Draw rounded pill background
                    const pillWidth = textWidth + padding * 2;
                    const pillHeight = textHeight + padding;
                    const radius = pillHeight / 2;

                    ctx.fillStyle = overlay.color;
                    ctx.beginPath();
                    ctx.roundRect(
                        x - pillWidth / 2,
                        y - pillHeight / 2,
                        pillWidth,
                        pillHeight,
                        radius
                    );
                    ctx.fill();

                    // Text color based on background
                    const isLightColor = overlay.color === '#FFFFFF' || overlay.color === '#FFD600';
                    ctx.fillStyle = isLightColor ? '#1F1F1F' : '#FFFFFF';
                    ctx.fillText(overlay.text, x, y);

                } else {
                    // Text style with shadow
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 4 * scaleFactor;
                    ctx.shadowOffsetX = 2 * scaleFactor;
                    ctx.shadowOffsetY = 2 * scaleFactor;

                    ctx.fillStyle = overlay.color;
                    ctx.fillText(overlay.text, x, y);

                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
            });

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                'image/jpeg',
                0.9
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}

/**
 * Convert blob to File object
 */
export function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
}