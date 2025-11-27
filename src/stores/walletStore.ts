import { create } from 'zustand';
import type { WalletBalance, ActivePowerDownResponse } from '../types/api';

interface WalletState {
    // Balances (mirrors WalletBalance from API)
    bonkWalletBalance: number;
    bonkRewardPool: number;
    dBonk: number;
    availableDBonk: number;
    powerDownLocked: number;
    laughWeight: number;
    isActivated: boolean;
    mpcWalletAddress: string | null;
    mpcWalletSolBalance: number | null;

    // Power Down
    powerDown: ActivePowerDownResponse | null;

    // Loading states
    isLoadingBalance: boolean;
    isLoadingPowerDown: boolean;

    // Actions
    setBalance: (data: WalletBalance) => void;
    setPowerDown: (data: ActivePowerDownResponse | null) => void;
    setLoadingBalance: (loading: boolean) => void;
    setLoadingPowerDown: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    bonkWalletBalance: 0,
    bonkRewardPool: 0,
    dBonk: 0,
    availableDBonk: 0,
    powerDownLocked: 0,
    laughWeight: 0,
    isActivated: false,
    mpcWalletAddress: null,
    mpcWalletSolBalance: null,
    powerDown: null,
    isLoadingBalance: false,
    isLoadingPowerDown: false,
};

export const useWalletStore = create<WalletState>()((set) => ({
    ...initialState,

    setBalance: (data) =>
        set({
            bonkWalletBalance: data.bonkWalletBalance,
            bonkRewardPool: data.bonkRewardPool,
            dBonk: data.dBonk,
            availableDBonk: data.availableDBonk,
            powerDownLocked: data.powerDownLocked,
            laughWeight: data.laughWeight,
            isActivated: data.isActivated,
            mpcWalletAddress: data.mpcWalletAddress,
            mpcWalletSolBalance: data.mpcWalletSolBalance,
        }),

    setPowerDown: (powerDown) => set({ powerDown }),

    setLoadingBalance: (isLoadingBalance) => set({ isLoadingBalance }),

    setLoadingPowerDown: (isLoadingPowerDown) => set({ isLoadingPowerDown }),

    reset: () => set(initialState),
}));