import { api } from './api';
import type { GenerateAIRequest, GenerationResult, GenerationStatus } from '../types/api';

export const aiService = {
    /**
     * POST /ai/generate
     * Generate AI content (image/video/gif)
     */
    generate: (data: GenerateAIRequest) =>
        api.post<GenerationResult>('/ai/generate', data),

    /**
     * GET /ai/status/:id
     * Get generation status
     */
    getStatus: (id: string) =>
        api.get<GenerationStatus>(`/ai/status/${id}`),
};