// Icons
import iconLaughDefault from '@/assets/icons/icon-laugh-default.png';
import iconBonk from '@/assets/icons/icon-bonk.png';

interface PendingRewards {
    totalPending: number;
    creatorRewards: number;
    curatorRewards: number;
    walletBalance?: number;
    bonkPower?: number;
    rewardPool?: number;
    laughWeight?: number;
}

interface RewardsListProps {
    pendingRewards: PendingRewards | null;
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
        if (num < 1 && num > 0) return num.toFixed(4);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    if (isLoading) {
        return <div className="earn-loading">Loading rewards...</div>;
    }

    // Only curator rewards need to be claimed
    // Creator rewards are auto-distributed on each laugh
    const curatorRewards = pendingRewards?.curatorRewards ?? 0;

    if (!pendingRewards || curatorRewards === 0) {
        return (
            <div className="earn-empty">
                <p>No pending rewards yet.</p>
                <p>Laugh early on memes to earn curation rewards!</p>
            </div>
        );
    }

    // Calculate claim split preview (70/30)
    const toWallet = curatorRewards * 0.7;
    const toPowerUp = curatorRewards * 0.3;
    const toPowerUpLP = toPowerUp * 15; // Convert to dBONK

    return (
        <div className="earn-list">
            {/* Curator Rewards */}
            <article className="earn-item">
                <div className="earn-item-avatar">
                    <img src={iconLaughDefault} alt="" />
                </div>
                <div className="earn-item-copy">
                    <div className="earn-item-title">Curation Rewards</div>
                    <div className="earn-item-meta">
                        <span className="meta-label">From early laughs on memes</span>
                    </div>
                    <div className="earn-item-meta">
                        <span className="meta-label">Pending</span>
                        <span className="meta-value">
                            <img src={iconBonk} alt="" />
                            {formatNumber(curatorRewards)}
                        </span>
                    </div>
                </div>
            </article>

            {/* Claim Summary & Button */}
            <div className="rewards-claim-section">
                <div className="rewards-claim-summary">
                    <div className="rewards-claim-row">
                        <span>Total to Claim</span>
                        <span className="rewards-claim-value">
                            <img src={iconBonk} alt="" />
                            {formatNumber(curatorRewards)}
                        </span>
                    </div>
                    <div className="rewards-claim-split">
                        <div className="rewards-split-item">
                            <span>To Wallet (70%)</span>
                            <span>{formatNumber(toWallet)} BONK</span>
                        </div>
                        <div className="rewards-split-item">
                            <span>To Laugh Power (30%)</span>
                            <span>{formatNumber(toPowerUpLP)} LP</span>
                        </div>
                    </div>
                </div>
                <button
                    className="earn-claim-btn rewards-claim-all"
                    onClick={onClaim}
                    disabled={isClaiming}
                >
                    {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                </button>
            </div>
        </div>
    );
}