import { api } from './api';

import type { ReferralCode, ReferralStats } from '../types/api';

export const referralService = {
    getCode: () => api.get<ReferralCode>('/referrals/code'),

    getStats: () => api.get<ReferralStats>('/referrals/stats'),
};