// Icons
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconBonk from '@/assets/icons/icon-bonk.png';

interface RewardsListProps {
    pendingRewards: {
        totalPending: number;
        creatorRewards: number;
        curatorRewards: number;
    } | null;
    onClaim: () => void;
    isLoading: boolean;
    isClaiming: boolean;
}

export function RewardsList({
    pendingRewards,
    onClaim,
    isLoading,
    isClaiming,
}: RewardsListProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    if (isLoading) {
        return <div className="earn-loading">Loading rewards...</div>;
    }

    if (!pendingRewards || pendingRewards.totalPending === 0) {
        return (
            <div className="earn-empty">
                <p>No pending rewards yet.</p>
                <p>Create memes or laugh at memes to earn rewards!</p>
            </div>
        );
    }

    // Build rewards array - mock multiple items like design
    const rewards: Array<{
        id: string;
        title: string;
        amount: number;
        claimed: boolean;
    }> = [];

    if (pendingRewards.creatorRewards > 0) {
        rewards.push({
            id: 'creator',
            title: 'Lorem ipsum is placeholder...',
            amount: pendingRewards.creatorRewards,
            claimed: false,
        });
    }

    if (pendingRewards.curatorRewards > 0) {
        rewards.push({
            id: 'curator',
            title: 'Lorem ipsum is placeholder...',
            amount: pendingRewards.curatorRewards,
            claimed: false,
        });
    }

    // If no specific rewards but has total, show generic
    if (rewards.length === 0 && pendingRewards.totalPending > 0) {
        rewards.push({
            id: 'total',
            title: 'Lorem ipsum is placeholder...',
            amount: pendingRewards.totalPending,
            claimed: false,
        });
    }

    return (
        <div className="earn-list">
            {rewards.map((reward) => (
                <article key={reward.id} className="earn-item">
                    <div className="earn-item-avatar">
                        <img src={iconLaughDefault} alt="" />
                    </div>
                    <div className="earn-item-copy">
                        <div className="earn-item-title">{reward.title}</div>
                        <div className="earn-item-meta">
                            <span className="meta-label">Reward</span>
                            <span className="meta-value">
                                <img src={iconBonk} alt="" />
                                {formatNumber(reward.amount)}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`earn-claim-btn ${reward.claimed ? 'claimed' : ''}`}
                        onClick={onClaim}
                        disabled={isClaiming || reward.claimed}
                    >
                        {reward.claimed ? 'Claimed' : isClaiming ? 'Claiming...' : 'Claim Bonk'}
                    </button>
                </article>
            ))}
        </div>
    );
}