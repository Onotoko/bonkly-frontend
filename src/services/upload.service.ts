
import { api } from './api';
import type { UploadResponse } from '../types/api';

export const uploadService = {
    image: (file: File, onProgress?: (percent: number) => void) =>
        api.upload('/upload/image', file, onProgress) as Promise<UploadResponse>,

    video: (file: File, onProgress?: (percent: number) => void) =>
        api.upload('/upload/video', file, onProgress) as Promise<UploadResponse>,
};