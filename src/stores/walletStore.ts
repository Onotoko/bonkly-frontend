import { create } from 'zustand';

interface PowerDownStatus {
    isActive: boolean;
    totalDbonk: number;
    remainingDbonk: number;
    weeklyPayout: number;
    currentWeek: number;
    totalWeeks: number;
    nextPayoutAt?: string;
    startedAt?: string;
}

interface WalletState {
    // Balances
    bonkBalance: number;
    dbonkBalance: number;
    pendingRewards: number;
    laughWeight: number;
    credits: number;

    // Power Down
    powerDownStatus: PowerDownStatus | null;

    // Loading states
    isLoadingBalance: boolean;
    isLoadingPowerDown: boolean;

    // Actions
    setBalances: (data: {
        bonkBalance?: number;
        dbonkBalance?: number;
        pendingRewards?: number;
        laughWeight?: number;
        credits?: number;
    }) => void;
    setPowerDownStatus: (status: PowerDownStatus | null) => void;
    setLoadingBalance: (loading: boolean) => void;
    setLoadingPowerDown: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    bonkBalance: 0,
    dbonkBalance: 0,
    pendingRewards: 0,
    laughWeight: 0,
    credits: 0,
    powerDownStatus: null,
    isLoadingBalance: false,
    isLoadingPowerDown: false,
};

export const useWalletStore = create<WalletState>()((set) => ({
    ...initialState,

    setBalances: (data) =>
        set((state) => ({
            bonkBalance: data.bonkBalance ?? state.bonkBalance,
            dbonkBalance: data.dbonkBalance ?? state.dbonkBalance,
            pendingRewards: data.pendingRewards ?? state.pendingRewards,
            laughWeight: data.laughWeight ?? state.laughWeight,
            credits: data.credits ?? state.credits,
        })),

    setPowerDownStatus: (powerDownStatus) => set({ powerDownStatus }),

    setLoadingBalance: (isLoadingBalance) => set({ isLoadingBalance }),

    setLoadingPowerDown: (isLoadingPowerDown) => set({ isLoadingPowerDown }),

    reset: () => set(initialState),
}));