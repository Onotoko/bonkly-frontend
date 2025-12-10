import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import { walletService } from '@/services/wallet.service';
import { useAuthStore } from '@/stores';
import { queryKeys } from './keys';
import type { CheckDepositResponse } from '@/types/api';

interface UseCheckDepositOptions {
    /** Polling interval in ms (default: 10000 = 10s) */
    pollingInterval?: number;
    /** Max polling attempts before stopping (default: 30 = 5 minutes) */
    maxAttempts?: number;
    /** Whether to start polling immediately (default: false) */
    autoStart?: boolean;
    /** Callback when deposit is found and activated */
    onActivated?: (result: CheckDepositResponse) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Callback when max attempts reached */
    onTimeout?: () => void;
}

export function useCheckDeposit(options: UseCheckDepositOptions = {}) {
    const {
        pollingInterval = 10000,
        maxAttempts = 30,
        autoStart = false,
        onActivated,
        onError,
        onTimeout,
    } = options;

    const [isPolling, setIsPolling] = useState(autoStart);
    const { user, setUser } = useAuthStore();
    const qc = useQueryClient();

    // Track attempts and activation state
    const attemptsRef = useRef(0);
    const hasActivatedRef = useRef(false);
    const timeoutCalledRef = useRef(false);

    const query = useQuery({
        queryKey: queryKeys.wallet.checkDeposit(),
        queryFn: async () => {
            attemptsRef.current += 1;

            const result = await walletService.checkDeposit();

            // Handle activation
            if (result.activated && result.found && !hasActivatedRef.current) {
                hasActivatedRef.current = true;
                setIsPolling(false);

                if (user) {
                    setUser({
                        ...user,
                        isActivated: true,
                        bonkRewardPool: result.bonkRewardPool ?? user.bonkRewardPool,
                        dBonk: result.dBonk ?? user.dBonk,
                        laughWeight: result.laughWeight ?? user.laughWeight,
                    });
                }

                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
                qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });

                onActivated?.(result);
            }

            // Check max attempts
            if (attemptsRef.current >= maxAttempts && !hasActivatedRef.current) {
                setIsPolling(false);
                if (!timeoutCalledRef.current) {
                    timeoutCalledRef.current = true;
                    onTimeout?.();
                }
            }

            return result;
        },
        enabled: isPolling && !!user && !user.isActivated,
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
        hasActivatedRef.current = false;
        timeoutCalledRef.current = false;
        setIsPolling(true);
    }, []);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
    }, []);

    const checkOnce = useCallback(() => {
        hasActivatedRef.current = false;
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