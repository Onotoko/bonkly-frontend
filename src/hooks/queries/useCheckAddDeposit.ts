import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import { walletService } from '@/services';
import { useAuthStore } from '@/stores';
import { queryKeys } from './keys';
import type { CheckAddDepositResponse } from '@/types/api';

interface UseCheckAddDepositOptions {
    /** Polling interval in ms (default: 5000 = 5s) */
    pollingInterval?: number;
    /** Max polling attempts before stopping (default: 60 = 5 minutes at 5s) */
    maxAttempts?: number;
    /** Whether to start polling immediately (default: false) */
    autoStart?: boolean;
    /** Callback when deposit is found */
    onSuccess?: (result: CheckAddDepositResponse) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Callback when max attempts reached */
    onTimeout?: () => void;
}

export function useCheckAddDeposit(options: UseCheckAddDepositOptions = {}) {
    const {
        pollingInterval = 5000,
        maxAttempts = 60,
        autoStart = false,
        onSuccess,
        onError,
        onTimeout,
    } = options;

    const [isPolling, setIsPolling] = useState(autoStart);
    const { user } = useAuthStore();
    const qc = useQueryClient();

    // Track attempts and success state
    const attemptsRef = useRef(0);
    const hasSucceededRef = useRef(false);
    const timeoutCalledRef = useRef(false);

    const query = useQuery({
        queryKey: queryKeys.wallet.checkAddDeposit(),
        queryFn: async () => {
            attemptsRef.current += 1;

            const result = await walletService.checkAddDeposit();

            // Handle success - deposit found
            if (result.found && !hasSucceededRef.current) {
                hasSucceededRef.current = true;
                setIsPolling(false);

                // Invalidate wallet queries to refresh balance
                qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
                qc.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });

                onSuccess?.(result);
            }

            // Check max attempts
            if (attemptsRef.current >= maxAttempts && !hasSucceededRef.current) {
                setIsPolling(false);
                if (!timeoutCalledRef.current) {
                    timeoutCalledRef.current = true;
                    onTimeout?.();
                }
            }

            return result;
        },
        enabled: isPolling && !!user?.isActivated,
        refetchInterval: isPolling ? pollingInterval : false,
        refetchIntervalInBackground: false,
        retry: 2,
        staleTime: 0,
    });

    // Handle errors
    const error = query.error as Error | null;
    if (error && onError) {
        setTimeout(() => onError(error), 0);
    }

    const startPolling = useCallback(() => {
        attemptsRef.current = 0;
        hasSucceededRef.current = false;
        timeoutCalledRef.current = false;
        setIsPolling(true);
    }, []);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
    }, []);

    const checkOnce = useCallback(() => {
        hasSucceededRef.current = false;
        return query.refetch();
    }, [query]);

    return {
        data: query.data,
        isChecking: query.isFetching,
        isPolling,
        error,
        maxAttempts,
        startPolling,
        stopPolling,
        checkOnce,
    };
}
