// ============ Common ============
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

// ============ Auth ============
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface TempData {
    googleId?: string;
    appleId?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    picture?: string;
}

export interface AuthResponse {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    needsReferral?: boolean;
    needsActivation?: boolean;
    depositAddress?: string;
    tempData?: TempData;
}

export interface CompleteSignupRequest {
    provider: 'google' | 'apple';
    providerData: TempData;
    referralCode: string;
}

export interface AppleSignInRequest {
    identityToken: string;
    user: string;
    email?: string;
    fullName?: string;
    referralCode?: string;
}

export interface ValidateReferralResponse {
    valid: boolean;
    referrer?: {
        username: string;
        displayName: string;
    } | null;
}

export interface ActivateAccountRequest {
    amount: number;
    txHash: string;
}

export interface ActivateResponse {
    message: string;
    bonkBalance: number;
    dbonkBalance: number;
    user: User;
    accessToken: string;
    refreshToken: string;
}


export interface User {
    _id: string;
    email: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    bio?: string;
    googleId?: string;
    appleId?: string;
    solanaAddress?: string;
    referralCode: string;
    referredBy?: string;
    referralCount: number;
    bonkRewardPool: number;
    dBonk: number;
    laughWeight: number;
    bonkWalletBalance: number;
    availableDBonk: number;
    powerDownLocked: number;
    aiCredits: number;
    totalLaughsReceived: number;
    totalLaughsGiven: number;
    totalMemesCreated: number;
    isActivated: boolean;
    isEmailVerified: boolean;
    lastActive?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    username: string;
    displayName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    solanaAddress?: string;
    referralCode: string;
    isActivated: boolean;
}

export interface UserBalances {
    bonkWalletBalance: number;
    bonkRewardPool: number;
    dBonk: number;
    availableDBonk: number;
    powerDownLocked: number;
    laughWeight: number;
    aiCredits: number;
    isActivated: boolean;
    estimatedLaughs: number;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    profilePicture?: string;
}

// Backend: UserSummaryDto (social)
export interface UserSummary {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
}

export interface WalletBalance {
    bonkWalletBalance: number;
    bonkRewardPool: number;
    dBonk: number;
    availableDBonk: number;
    powerDownLocked: number;
    laughWeight: number;
    isActivated: boolean;
    mpcWalletAddress: string | null;
    mpcWalletSolBalance: number | null;
}

export interface WithdrawRequest {
    amount: number;
    destinationAddress: string;
}

export interface WithdrawRequestResponse {
    withdrawalId: string;
    amount: number;
    estimatedFee: number;
    feePaymentAddress: string;
    message: string;
}

export interface WithdrawConfirmRequest {
    withdrawalRequestId: string;
    feePaymentTxHash: string;
}

export interface WithdrawConfirmResponse {
    success: boolean;
    message: string;
    status: string;
    bonkTransactionId?: string;
}

export interface PowerDownStartRequest {
    dbonkAmount: number;
}

export interface PowerDownStatus {
    id: string;
    userId: string;
    totalDBonkAmount: number;
    totalBonkEquivalent: number;
    weeklyDBonkAmount: number;
    weeklyBonkAmount: number;
    weeksCompleted: number;
    dbonkConverted: number;
    bonkDistributed: number;
    startDate: string;
    nextPayoutDate: string;
    completionDate?: string;
    status: string;
    remainingWeeks: number;
    estimatedCompletion: string;
}

export interface ActivePowerDownResponse {
    hasPowerDown: boolean;
    powerDown?: PowerDownStatus;
    message?: string;
}

export interface CancelPowerDownResponse {
    success: boolean;
    message: string;
    dbonkReturned: number;
    bonkReceived: number;
    weeksCompleted: number;
}

export interface PowerDownHistoryResponse {
    powerDowns: PowerDownStatus[];
    pagination: PaginationMeta;
}

export interface Meme {
    id: string;
    lastId: number;
    creator: {
        id: string;
        username: string;
        displayName: string;
        profilePicture?: string;
    };
    mediaUrl: string;
    caption?: string;
    tags: string[];
    mediaType: 'image' | 'video' | 'gif';
    isAIGenerated: boolean;
    loveCount: number;
    laughCount: number;
    commentCount: number;
    shareCount: number;
    viewCount: number;
    hasLoved: boolean;
    hasLaughed: boolean;
    hasSaved: boolean;
    totalBonkReceived: number;
    createdAt: string;
    isCurationOpen: boolean;
    curatorCount: number;
}

export interface CreateMemeRequest {
    mediaUrl: string;
    caption?: string;
    tags?: string[];
    mediaType: 'image' | 'video' | 'gif';
    isAIGenerated?: boolean;
    aiPrompt?: string;
    aiModel?: string;
    visibility?: 'public' | 'private';
}

export interface LaughRequest {
    sliderPercentage: number; // 0-100, default 100
}

export interface LaughResponse {
    success: boolean;
    laughId: string;
    bonkSpent: number;
    distribution: {
        creator: number;
        curators: number;
        platform: number;
    };
    creatorSplit: {
        claimable: number;
        powerUp: number;
        powerUpDBonk: number;
    };
    isCurator: boolean;
    curatorPosition?: number;
    remainingBonkPool: number;
    newLaughWeight: number;
    estimatedRemainingLaughs: number;
}

export interface MemeListResponse {
    memes: Meme[];
    pagination: PaginationMeta;
}


export interface Comment {
    id: string;
    user: {
        id: string;
        username: string;
        displayName: string;
        profilePicture?: string;
    };
    memeId: string;
    content: string;
    parentCommentId?: string;
    likeCount: number;
    replyCount: number;
    hasLiked: boolean;
    isOwner: boolean;
    createdAt: string;
}

export interface CreateCommentRequest {
    content: string;
    parentCommentId?: string;
}

export interface CommentListResponse {
    comments: Comment[];
    pagination: PaginationMeta;
}


export interface PendingRewards {
    totalPending: number;
    creatorRewards: number;
    curatorRewards: number;
    walletBalance: number;
    bonkPower: number;
    rewardPool: number;
    laughWeight: number;
}

export interface ClaimRewardsResponse {
    success: boolean;
    totalClaimed: number;
    claimableBonk: number;
    powerUpBonk: number;
    powerUpDBonk: number;
    newDBonkBalance: number;
    newLaughWeight: number;
    rewardsClaimed: {
        creator: number;
        curator: number;
    };
}

export interface FollowResponse {
    success: boolean;
    following: boolean;
    followersCount: number;
    followingCount: number;
}

export interface IsFollowingResponse {
    isFollowing: boolean;
}

export interface FollowListResponse {
    users: UserSummary[];
    pagination: PaginationMeta;
}

export interface CreditPackage {
    _id: string;
    packageId: string;      // "credits_10", "credits_50", etc.
    credits: number;
    bonkCost: number;
    discount: number;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreditBalance {
    credits: number;
    bonkWalletBalance: number;
}

export interface PurchaseCreditsRequest {
    packageId: string;
}

export interface PurchaseCreditsResponse {
    success: boolean;
    credits: number;
    bonkSpent: number;
    newBalance: number;
    transaction: CreditTransaction;
}

export interface CreditTransaction {
    id: string;
    type: string;
    credits: number;
    bonkAmount: number;
    packageId?: string;
    description?: string;
    balanceAfter: number;
    createdAt: string;
}

export interface ReferralStats {
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    pendingReferrals: number;
    referralList: {
        username: string;
        joinedAt: string;
        isActivated: boolean;
    }[];
}

export interface UploadResponse {
    success: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    size: number;
}

export interface GenerateAIRequest {
    prompt: string;
    mediaType: 'image' | 'video' | 'gif';
    duration?: number; // 5-60 for video
}

// export interface GenerationResult {
//     success: boolean;
//     url: string;
//     mediaType: string;
//     creditsUsed: number;
//     creditsRemaining: number;
//     generationId: string;
//     metadata?: Record<string, unknown>;
// }

export interface GenerationStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
}

export interface FeedParams {
    page?: number;
    limit?: number;
}

export interface CheckDepositResponse {
    found: boolean;
    activated?: boolean;
    amount?: number;
    txHash?: string;
    bonkRewardPool?: number;
    dBonk?: number;
    laughWeight?: number;
    message?: string;
}

export interface TrendingTagsResponse {
    tags: string[];
}

export interface GenerateAIRequest {
    prompt: string;
    mediaType: 'image' | 'video' | 'gif';
    duration?: number;
    referenceMediaUrl?: string; // NEW: Optional reference image/video URL
}

export interface GenerationResult {
    success: boolean;
    url: string;
    mediaType: 'image' | 'video' | 'gif';
    creditsUsed: number;
    creditsRemaining: number;
    generationId: string;
    metadata?: Record<string, unknown>;
}

export interface GenerationStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
}

export interface UploadResult {
    url: string;
    key: string;
    size: number;
    mimetype: string;
}

export interface PublicUserProfile {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    bio?: string;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
    isFollowingYou: boolean;
}