export const queryKeys = {
    // User
    user: {
        all: ['user'] as const,
        me: () => [...queryKeys.user.all, 'me'] as const,
        balances: () => [...queryKeys.user.all, 'balances'] as const,
        byUsername: (username: string) => [...queryKeys.user.all, 'profile', username] as const,
        memes: (username: string) => [...queryKeys.user.all, 'memes', username] as const,
    },

    // Memes
    memes: {
        all: ['memes'] as const,
        detail: (id: string) => [...queryKeys.memes.all, 'detail', id] as const,
        feedNew: () => [...queryKeys.memes.all, 'feed', 'new'] as const,
        feedTrending: () => [...queryKeys.memes.all, 'feed', 'trending'] as const,
        feedForYou: () => [...queryKeys.memes.all, 'feed', 'for-you'] as const,
        saved: () => [...queryKeys.memes.all, 'saved'] as const,
        search: (query: string) => ['memes', 'search', query] as const,
        trendingTags: () => ['memes', 'tags', 'trending'] as const,
    },

    // Wallet
    wallet: {
        all: ['wallet'] as const,
        balance: () => [...queryKeys.wallet.all, 'balance'] as const,
        withdrawRequests: () => [...queryKeys.wallet.all, 'withdraw', 'requests'] as const,
        powerDownStatus: () => [...queryKeys.wallet.all, 'power-down', 'status'] as const,
        powerDownHistory: () => [...queryKeys.wallet.all, 'power-down', 'history'] as const,
        checkDeposit: () => [...queryKeys.wallet.all, 'check-deposit'] as const,
        transactions: (page?: number) => [...queryKeys.wallet.all, 'transactions', page] as const,
        depositInfo: () => [...queryKeys.wallet.all, 'deposit-info'] as const,
        checkAddDeposit: () => [...queryKeys.wallet.all, 'check-add-deposit'] as const,
    },

    // Social
    social: {
        all: ['social'] as const,
        followers: (username: string) => [...queryKeys.social.all, 'followers', username] as const,
        following: (username: string) => [...queryKeys.social.all, 'following', username] as const,
        isFollowing: (username: string) => [...queryKeys.social.all, 'is-following', username] as const,
    },

    // Comments
    comments: {
        all: ['comments'] as const,
        byMeme: (memeId: string) => [...queryKeys.comments.all, 'meme', memeId] as const,
        replies: (commentId: string) => [...queryKeys.comments.all, 'replies', commentId] as const,
    },

    // Rewards
    rewards: {
        all: ['rewards'] as const,
        pending: () => [...queryKeys.rewards.all, 'pending'] as const,
    },

    // Credits
    credits: {
        all: ['credits'] as const,
        packages: () => [...queryKeys.credits.all, 'packages'] as const,
        balance: () => [...queryKeys.credits.all, 'balance'] as const,
        history: () => [...queryKeys.credits.all, 'history'] as const,
    },

    // Referrals
    referrals: {
        all: ['referrals'] as const,
        stats: () => [...queryKeys.referrals.all, 'stats'] as const,
        validate: (code: string) => [...queryKeys.referrals.all, 'validate', code] as const,
        leaderboard: () => [...queryKeys.referrals.all, 'leaderboard'] as const,
    },

    // AI
    ai: {
        all: ['ai'] as const,
        status: (id: string) => [...queryKeys.ai.all, 'status', id] as const,
    },
};