import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import { walletService } from '@/services/wallet.service';
import { useAuthStore } from '@/stores';
import { queryKeys } from './keys';
import type { CheckDepositResponse } from '@/types/api';

interface UseCheckDepositOptions {
    /** Polling interval in ms (default: 10000 = 10s) */
    pollingInterval?: number;
    /** Whether to start polling immediately (default: false) */
    autoStart?: boolean;
    /** Callback when deposit is found and activated */
    onActivated?: (result: CheckDepositResponse) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
}

export function useCheckDeposit(options: UseCheckDepositOptions = {}) {
    const {
        pollingInterval = 10000,
        autoStart = false,
        onActivated,
        onError,
    } = options;

    const [isPolling, setIsPolling] = useState(autoStart);
    const { user, setUser } = useAuthStore();
    const qc = useQueryClient();

    // Track if we've already handled activation to prevent double calls
    const hasActivatedRef = useRef(false);

    const query = useQuery({
        queryKey: queryKeys.wallet.checkDeposit(),
        queryFn: async () => {
            const result = await walletService.checkDeposit();

            // Handle activation inside queryFn to avoid useEffect issues
            if (result.activated && result.found && !hasActivatedRef.current) {
                hasActivatedRef.current = true;

                // Stop polling
                setIsPolling(false);

                // Update user in store
                if (user) {
                    setUser({
                        ...user,
                        isActivated: true,
                        bonkRewardPool: result.bonkRewardPool ?? user.bonkRewardPool,
                        dBonk: result.dBonk ?? user.dBonk,
                        laughWeight: result.laughWeight ?? user.laughWeight,
                    });
                }

                // Invalidate related queries
                qc.invalidateQueries({ queryKey: queryKeys.user.me() });
                qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });

                // Call callback
                onActivated?.(result);
            }

            return result;
        },
        enabled: isPolling && !!user && !user.isActivated,
        refetchInterval: isPolling ? pollingInterval : false,
        refetchIntervalInBackground: false,
        retry: 2,
        staleTime: 0,
    });

    // Handle errors via query's error state
    const error = query.error as Error | null;
    if (error && onError) {
        // Use setTimeout to avoid sync setState in render
        setTimeout(() => onError(error), 0);
    }

    const startPolling = useCallback(() => {
        hasActivatedRef.current = false;
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
        startPolling,
        stopPolling,
        checkOnce,
    };
}