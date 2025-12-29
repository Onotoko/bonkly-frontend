// Icons
import iconBonk from '@/assets/icons/icon-bonk.png';
// import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconLaughWeight from '@/assets/icons/icon-laugh-weight.svg';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description?: string;
}

interface TransactionsListProps {
    transactions: Transaction[];
    isLoading: boolean;
    hasNextPage: boolean;
    onLoadMore: () => void;
    isFetchingMore: boolean;
}

export function TransactionsList({
    transactions,
    isLoading,
    hasNextPage,
    onLoadMore,
    isFetchingMore,
}: TransactionsListProps) {
    // Fixed: Handle small decimal amounts properly
    const formatAmount = (num: number) => {
        const absNum = Math.abs(num);

        if (absNum >= 1000000) {
            return `${(absNum / 1000000).toFixed(1)}M`;
        }
        if (absNum >= 1000) {
            return `${(absNum / 1000).toFixed(1)}K`;
        }
        if (absNum >= 1) {
            return absNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
        if (absNum > 0) {
            // For amounts less than 1, show up to 4 decimal places
            return absNum.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            });
        }
        return '0';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getTransactionTitle = (type: string) => {
        const titles: Record<string, string> = {
            withdraw: 'Withdrawal',
            deposit: 'Deposit',
            power_up: 'Power Up',
            power_down_distribution: 'Power Down',
            laugh_distribution: 'Laugh Distribution',
            laugh_sent: 'Laugh Sent',
            laugh_received: 'Laugh Received',
            creator_reward: 'Creator Reward',
            curator_reward: 'Curator Reward',
            ai_credit_purchase: 'Credit Purchase',
        };
        return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const getTransactionIcon = (type: string) => {
        // Power Up/Down use Laugh Weight icon for avatar
        if (type === 'power_up' || type === 'power_down_distribution') {
            return iconLaughWeight;
        }
        // Laugh transactions use laugh icon for avatar
        // if (type.includes('laugh')) {
        //     return iconLaughDefault;
        // }
        // Default to BONK
        return iconBonk;
    };

    const getTypeLabel = (type: string) => {
        if (type === 'power_up' || type === 'power_down_distribution') {
            return 'Laugh Power';
        }
        return 'Bonk';
    };

    // const getAmountIcon = (type: string) => {
    //     // Only Power Up/Down show Laugh Power icon for amount
    //     if (type === 'power_up' || type === 'power_down_distribution') {
    //         return iconLaughWeight;
    //     }
    //     // Everything else is BONK
    //     return iconBonk;
    // };

    // Determine if transaction is positive (incoming) or negative (outgoing)
    const isPositive = (type: string) => {
        const positiveTypes = [
            'deposit',
            'creator_reward',
            'curator_reward',
            'power_down_distribution',
        ];
        return positiveTypes.includes(type);
    };

    if (isLoading) {
        return <div className="earn-loading">Loading transactions...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="earn-empty">
                <p>No transactions yet.</p>
            </div>
        );
    }

    return (
        <div className="earn-list">
            {transactions.map((txn) => {
                const positive = isPositive(txn.type);

                return (
                    <article key={txn.id} className="earn-item">
                        <div className="earn-item-avatar">
                            <img src={getTransactionIcon(txn.type)} alt="" />
                        </div>
                        <div className="earn-item-copy">
                            <div className="earn-item-title">{getTransactionTitle(txn.type)}</div>
                            <div className="earn-item-meta">
                                <span className="meta-label">{getTypeLabel(txn.type)}</span>
                                <span className={`meta-value ${positive ? 'positive' : 'negative'}`}>
                                    <img src={iconBonk} alt="" />
                                    {positive ? '+' : '-'}{formatAmount(txn.amount)}
                                </span>
                            </div>
                        </div>
                        <span className="txn-date">{formatDate(txn.createdAt)}</span>
                    </article>
                );
            })}

            {hasNextPage && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                        className="earn-claim-btn"
                        onClick={onLoadMore}
                        disabled={isFetchingMore}
                    >
                        {isFetchingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}