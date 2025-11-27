import { api } from './api';

export const uploadService = {
    /**
     * POST /upload/media
     * Upload meme media (image or video)
     */
    uploadMedia: (file: File, onProgress?: (percent: number) => void) =>
        api.upload('/upload/media', file, onProgress),

    /**
     * POST /upload/avatar
     * Upload avatar image
     */
    uploadAvatar: (file: File, onProgress?: (percent: number) => void) =>
        api.upload('/upload/avatar', file, onProgress),
};