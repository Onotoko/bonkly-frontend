import { useState } from 'react';

// Components
import {
    AddBonkSheet,
    WithdrawSheet,
    PendingWithdrawalsSheet,
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
    useConfirmWithdraw,
    useCancelWithdraw,
    useWithdrawRequests,
    useStartPowerDown,
    usePowerUp,
} from '@/hooks/queries/useWallet';
import { usePendingRewards, useClaimRewards } from '@/hooks/queries/useRewards';

// Icons
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';
import iconArrowRight from '@/assets/icons/icon-arrow-right.svg';

type EarnTab = 'rewards' | 'transactions';

interface WithdrawalRequest {
    withdrawalId: string;
    amount: number;
    destinationAddress: string;
    estimatedFee: number;
    feePaymentAddress: string;
    status: string;
    createdAt: string;
    failedAt?: string;
    completedAt?: string;
    metadata?: {
        failureReason?: string;
        autoRefunded?: boolean;
    };
}

export function EarnPage() {
    const [activeTab, setActiveTab] = useState<EarnTab>('rewards');

    // Modal states
    const [showAddBonk, setShowAddBonk] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showPendingWithdrawals, setShowPendingWithdrawals] = useState(false);
    const [showLaughPower, setShowLaughPower] = useState(false);
    const [showPowerUp, setShowPowerUp] = useState(false);
    const [showPowerDown, setShowPowerDown] = useState(false);

    // Continue withdrawal from pending
    const [continueWithdrawal, setContinueWithdrawal] = useState<WithdrawalRequest | null>(null);

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
    const withdrawRequestsQuery = useWithdrawRequests();

    // Mutations
    const requestWithdrawMutation = useRequestWithdraw();
    const confirmWithdrawMutation = useConfirmWithdraw();
    const cancelWithdrawMutation = useCancelWithdraw();
    const claimMutation = useClaimRewards();
    const powerDownMutation = useStartPowerDown();
    const powerUpMutation = usePowerUp();

    // Derived data
    const balance = balanceQuery.data;
    const bonkBalance = balance?.bonkWalletBalance ?? 0;
    const dBonkBalance = balance?.dBonk ?? 0;
    const depositAddress = balance?.mpcWalletAddress ?? '';

    const pendingRewards = rewardsQuery.data ?? null;

    const transactions =
        transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [];

    // Get pending withdrawals
    const withdrawalRequests: WithdrawalRequest[] =
        withdrawRequestsQuery.data?.pages.flatMap((page) =>
            page.requests.map((r) => ({
                withdrawalId: r.withdrawalId,
                amount: r.amount,
                destinationAddress: r.destinationAddress ?? '',
                estimatedFee: r.estimatedFee,
                feePaymentAddress: r.feePaymentAddress,
                status: r.status ?? 'awaiting_fee_payment',
                createdAt: r.createdAt ?? new Date().toISOString(),
                metadata: r.metadata,
            }))
        ) ?? [];

    const pendingCount = withdrawalRequests.filter(
        (w) => w.status === 'awaiting_fee_payment' || w.status === 'processing'
    ).length;

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

    // ============ Withdraw Handlers ============

    const handleOpenWithdraw = () => {
        // Check for pending withdrawals first
        if (pendingCount > 0) {
            setShowPendingWithdrawals(true);
        } else {
            setShowWithdraw(true);
        }
    };

    const handleRequestWithdraw = async (amount: number, address: string) => {
        const response = await requestWithdrawMutation.mutateAsync({
            amount,
            destinationAddress: address,
        });
        // Refetch withdraw requests
        withdrawRequestsQuery.refetch();
        return {
            withdrawalId: response.withdrawalId,
            amount: response.amount,
            estimatedFee: response.estimatedFee,
            feePaymentAddress: response.feePaymentAddress,
        };
    };

    const handleConfirmWithdraw = async (withdrawalId: string, feePaymentTxHash: string) => {
        await confirmWithdrawMutation.mutateAsync({
            withdrawalRequestId: withdrawalId,
            feePaymentTxHash,
        });
        // Refetch data
        withdrawRequestsQuery.refetch();
        balanceQuery.refetch();
        // Close modal and show success
        setShowWithdraw(false);
        setContinueWithdrawal(null);
        showSuccess(
            'Withdrawal Processing!',
            'Your BONK withdrawal is being processed. You will receive it in your wallet shortly.'
        );
    };

    const handleCancelWithdraw = async (withdrawalId: string) => {
        await cancelWithdrawMutation.mutateAsync(withdrawalId);
        // Refetch data
        withdrawRequestsQuery.refetch();
        balanceQuery.refetch();
    };

    const handleContinueWithdrawal = (withdrawal: WithdrawalRequest) => {
        setContinueWithdrawal(withdrawal);
        setShowPendingWithdrawals(false);
        setShowWithdraw(true);
    };



    // ============ Claim Handler ============

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

    // ============ Power Up Handler ============

    const handlePowerUp = (amount: number) => {
        powerUpMutation.mutate(
            { bonkAmount: amount },
            {
                onSuccess: (data) => {
                    setShowPowerUp(false);
                    setShowLaughPower(false);
                    showSuccess(
                        'Power Up Complete!',
                        `You converted ${formatNumber(amount)} BONK to ${formatNumber(data.dbonkReceived)} Laugh Power!`
                    );
                },
                onError: (error) => {
                    const msg = error instanceof Error ? error.message : 'Please try again.';
                    showError('Power Up Failed', msg);
                },
            }
        );
    };

    // ============ Power Down Handler ============

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
                    const msg = error instanceof Error ? error.message : 'Please try again.';
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

            {/* Balance Section */}
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
                    <button className="earn-btn withdraw" onClick={handleOpenWithdraw}>
                        Withdraw BONK
                        {pendingCount > 0 && (
                            <span className="earn-btn-badge">{pendingCount}</span>
                        )}
                    </button>
                    <button className="earn-btn add" onClick={() => setShowAddBonk(true)}>
                        Add BONK
                    </button>
                </div>
            </section>

            {/* Laugh Power Card */}
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

            {/* Tabs + List Block */}
            <section className="earn-block-list">
                <div className="earn-drawer-handle" />

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

                <div className="earn-tabs-divider" />

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

            <PendingWithdrawalsSheet
                isOpen={showPendingWithdrawals}
                onClose={() => setShowPendingWithdrawals(false)}
                withdrawals={withdrawalRequests}
                isLoading={withdrawRequestsQuery.isLoading}
                onContinue={handleContinueWithdrawal}
                onCancel={handleCancelWithdraw}
                isCancelling={cancelWithdrawMutation.isPending}
            />

            <WithdrawSheet
                isOpen={showWithdraw}
                onClose={() => {
                    setShowWithdraw(false);
                    setContinueWithdrawal(null);
                }}
                balance={bonkBalance}
                onRequestWithdraw={handleRequestWithdraw}
                onConfirmWithdraw={handleConfirmWithdraw}
                onCancelWithdraw={handleCancelWithdraw}
                isRequesting={requestWithdrawMutation.isPending}
                isConfirming={confirmWithdrawMutation.isPending}
                initialWithdrawal={continueWithdrawal}
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
                isLoading={powerUpMutation.isPending}
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