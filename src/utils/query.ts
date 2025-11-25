import type { FeedParams } from '../types/api';

export const buildQuery = (params?: FeedParams): string => {
    if (!params) return '';
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return qs ? `?${qs}` : '';
};