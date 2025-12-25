// Icons
import iconBonk from '@/assets/icons/icon-bonk.png';
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';

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
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
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
            withdraw: 'Withdrawn',
            deposit: 'Top Up',
            power_up: 'Top Up',
            power_down: 'Power Down',
            laugh_sent: 'Laugh Sent',
            laugh_received: 'Laugh Received',
            creator_reward: 'Creator Reward',
            curator_reward: 'Curator Reward',
            credit_purchase: 'Credit Purchase',
        };
        return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const getTransactionIcon = (type: string) => {
        if (type.includes('laugh') || type.includes('reward') || type === 'power_up') {
            return iconLaughDefault;
        }
        return iconBonk;
    };

    const getTypeLabel = (type: string) => {
        if (type === 'power_up' || type === 'power_down') {
            return 'Laugh Power';
        }
        return 'Bonk';
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
            {transactions.map((txn) => (
                <article key={txn.id} className="earn-item">
                    <div className="earn-item-avatar">
                        <img src={getTransactionIcon(txn.type)} alt="" />
                    </div>
                    <div className="earn-item-copy">
                        <div className="earn-item-title">{getTransactionTitle(txn.type)}</div>
                        <div className="earn-item-meta">
                            <span className="meta-label">{getTypeLabel(txn.type)}</span>
                            <span className="meta-value">
                                <img src={iconBonk} alt="" />
                                {formatNumber(Math.abs(txn.amount))}
                            </span>
                        </div>
                    </div>
                    <span className="txn-date">{formatDate(txn.createdAt)}</span>
                </article>
            ))}

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