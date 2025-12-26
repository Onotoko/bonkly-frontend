import { useState } from 'react';

// Components
import {
    AddBonkSheet,
    WithdrawSheet,
    LaughPowerSheet,
    PowerUpSheet,
    PowerDownSheet,
    RewardsList,
    TransactionsList,
} from '@/components/earn';
import { ResultModal } from '@/components/ui';

// Hooks
import {
    useWalletBalance,
    useTransactions,
    useRequestWithdraw,
    useStartPowerDown,
} from '@/hooks/queries/useWallet';
import { usePendingRewards, useClaimRewards } from '@/hooks/queries/useRewards';

// Icons
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconArrowRight from '@/assets/icons/icon-arrow-right.svg';

type EarnTab = 'rewards' | 'transactions';

export function EarnPage() {
    const [activeTab, setActiveTab] = useState<EarnTab>('rewards');

    // Modal states
    const [showAddBonk, setShowAddBonk] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showLaughPower, setShowLaughPower] = useState(false);
    const [showPowerUp, setShowPowerUp] = useState(false);
    const [showPowerDown, setShowPowerDown] = useState(false);

    // Result modal
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    // Data queries
    const balanceQuery = useWalletBalance();
    const rewardsQuery = usePendingRewards();
    const transactionsQuery = useTransactions();

    // Mutations
    const withdrawMutation = useRequestWithdraw();
    const claimMutation = useClaimRewards();
    const powerDownMutation = useStartPowerDown();

    // Derived data
    const balance = balanceQuery.data;
    const bonkBalance = balance?.bonkWalletBalance ?? 0;
    const dBonkBalance = balance?.dBonk ?? 0;
    const depositAddress = balance?.mpcWalletAddress ?? '';

    const pendingRewards = rewardsQuery.data ?? null;

    const transactions =
        transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [];

    // Helpers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const showSuccess = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'success', title, message });
    };

    const showError = (title: string, message: string) => {
        setResultModal({ isOpen: true, type: 'error', title, message });
    };

    const closeResultModal = () => {
        setResultModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Handlers
    const handleWithdraw = (amount: number, address: string) => {
        withdrawMutation.mutate(
            { amount, destinationAddress: address },
            {
                onSuccess: () => {
                    setShowWithdraw(false);
                    showSuccess(
                        'Withdrawal Initiated!',
                        'Your BONK withdrawal has been initiated. Please complete the fee payment to proceed.'
                    );
                },
                onError: (error) => {
                    const msg =
                        error instanceof Error ? error.message : 'Please try again.';
                    showError('Withdrawal Failed', msg);
                },
            }
        );
    };

    const handleClaim = () => {
        claimMutation.mutate(undefined, {
            onSuccess: (data) => {
                showSuccess(
                    'Rewards Claimed!',
                    `You claimed ${formatNumber(data.totalClaimed)} BONK!`
                );
            },
            onError: (error) => {
                const msg = error instanceof Error ? error.message : 'Please try again.';
                showError('Claim Failed', msg);
            },
        });
    };

    const handlePowerUp = (amount: number) => {
        console.log('Power up:', amount);
        setShowPowerUp(false);
        setShowLaughPower(false);
        showSuccess('Power Up Complete!', 'Your BONK has been converted to Laugh Power.');
    };

    const handlePowerDown = (amount: number) => {
        powerDownMutation.mutate(
            { dbonkAmount: amount },
            {
                onSuccess: () => {
                    setShowPowerDown(false);
                    setShowLaughPower(false);
                    showSuccess(
                        'Power Down Started!',
                        'Your Laugh Power is unlocking. Funds will flow to your wallet over 8 weeks.'
                    );
                },
                onError: (error) => {
                    const msg =
                        error instanceof Error ? error.message : 'Please try again.';
                    showError('Power Down Failed', msg);
                },
            }
        );
    };

    const openPowerUp = () => {
        setShowLaughPower(false);
        setShowPowerUp(true);
    };

    const openPowerDown = () => {
        setShowLaughPower(false);
        setShowPowerDown(true);
    };

    return (
        <div className="earn-shell">
            {/* Header */}
            <header className="earn-header">
                <h1>Your Earnings</h1>
            </header>

            {/* Balance Section - NO white box wrapper */}
            <section className="earn-balance">
                <p className="earn-balance-label">Balance</p>
                <div className="earn-amount">
                    <img src={iconBonk} alt="" />
                    <span>{formatNumber(bonkBalance)}</span>
                </div>
                <p className="earn-sub">
                    This is your available BONK. Cash it out or use it to boost your Laugh Power.
                </p>
                <div className="earn-actions">
                    <button className="earn-btn withdraw" onClick={() => setShowWithdraw(true)}>
                        Withdraw BONK
                    </button>
                    <button className="earn-btn add" onClick={() => setShowAddBonk(true)}>
                        Add BONK
                    </button>
                </div>
            </section>

            {/* Laugh Power Card - White box */}
            <section className="earn-card" onClick={() => setShowLaughPower(true)}>
                <div className="earn-card-top">
                    <div className="earn-card-title">
                        <img src={iconLaughWeight} alt="" />
                        <span>Laugh Power</span>
                    </div>
                    <div className="earn-card-right">
                        <span>{formatNumber(dBonkBalance)}</span>
                        <img src={iconArrowRight} alt="" />
                    </div>
                </div>
                <p className="earn-card-sub">
                    Your influence power for earning curation rewards.
                </p>
            </section>

            {/* Tabs + List Block - White box */}
            <section className="earn-block-list">
                {/* Drawer Handle */}
                <div className="earn-drawer-handle" />

                {/* Tabs */}
                <div className="earn-tabs">
                    <button
                        className={`earn-tab ${activeTab === 'rewards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rewards')}
                    >
                        Curation Rewards
                    </button>
                    <button
                        className={`earn-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transaction
                    </button>
                </div>

                {/* Divider */}
                <div className="earn-tabs-divider" />

                {/* Tab Content */}
                {activeTab === 'rewards' && (
                    <RewardsList
                        pendingRewards={pendingRewards}
                        onClaim={handleClaim}
                        isLoading={rewardsQuery.isLoading}
                        isClaiming={claimMutation.isPending}
                    />
                )}

                {activeTab === 'transactions' && (
                    <TransactionsList
                        transactions={transactions}
                        isLoading={transactionsQuery.isLoading}
                        hasNextPage={transactionsQuery.hasNextPage ?? false}
                        onLoadMore={() => transactionsQuery.fetchNextPage()}
                        isFetchingMore={transactionsQuery.isFetchingNextPage}
                    />
                )}
            </section>

            {/* Modals */}
            <AddBonkSheet
                isOpen={showAddBonk}
                onClose={() => setShowAddBonk(false)}
                depositAddress={depositAddress}
            />

            <WithdrawSheet
                isOpen={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                balance={bonkBalance}
                onSubmit={handleWithdraw}
                isLoading={withdrawMutation.isPending}
            />

            <LaughPowerSheet
                isOpen={showLaughPower}
                onClose={() => setShowLaughPower(false)}
                dBonkBalance={dBonkBalance}
                onPowerDown={openPowerDown}
                onPowerUp={openPowerUp}
            />

            <PowerUpSheet
                isOpen={showPowerUp}
                onClose={() => setShowPowerUp(false)}
                bonkBalance={bonkBalance}
                dBonkBalance={dBonkBalance}
                onSubmit={handlePowerUp}
                isLoading={false}
            />

            <PowerDownSheet
                isOpen={showPowerDown}
                onClose={() => setShowPowerDown(false)}
                dBonkBalance={dBonkBalance}
                onSubmit={handlePowerDown}
                isLoading={powerDownMutation.isPending}
            />

            {/* Result Modal */}
            <ResultModal
                isOpen={resultModal.isOpen}
                type={resultModal.type}
                title={resultModal.title}
                message={resultModal.message}
                primaryLabel="Okay"
                onPrimary={closeResultModal}
            />
        </div>
    );
}