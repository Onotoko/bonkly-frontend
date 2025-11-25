import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../../services';
import { queryKeys } from './keys';
import type { GenerateAIRequest } from '../../types/api';

export const useGenerateAI = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: GenerateAIRequest) => aiService.generate(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.credits.balance() });
        },
    });
};

export const useAIStatus = (id: string, enabled = true) => {
    return useQuery({
        queryKey: queryKeys.ai.status(id),
        queryFn: () => aiService.getStatus(id),
        enabled: !!id && enabled,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === 'completed' || status === 'failed') return false;
            return 2000; // Poll every 2s while pending/processing
        },
    });
};