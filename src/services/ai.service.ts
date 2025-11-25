import { api } from './api';
import type { GenerateAIRequest, GenerationResult } from '../types/api';

export const aiService = {
    generate: (data: GenerateAIRequest) =>
        api.post<GenerationResult>('/ai/generate', data),

    getStatus: (id: string) =>
        api.get<GenerationResult>(`/ai/status/${id}`),
};