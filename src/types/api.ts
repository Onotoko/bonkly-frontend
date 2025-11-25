// ============ Common ============
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
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

export interface GoogleCallbackRequest {
    idToken: string;
    referralCode?: string;
}

export interface AppleCallbackRequest {
    identityToken: string;
    user?: { email?: string; name?: { firstName?: string; lastName?: string } };
    referralCode?: string;
}

export interface ValidateReferralResponse {
    valid: boolean;
    referrerUsername?: string;
}

export interface CompleteSignupRequest {
    tempToken: string;
    username: string;
    referralCode?: string;
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
    isNewUser?: boolean;
    tempToken?: string; // For incomplete signup
}

// ============ User ============
export interface User {
    id: string;
    username: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    isActivated: boolean;
    followerCount: number;
    followingCount: number;
    memeCount: number;
    totalLaughs: number;
    createdAt: string;
}

export interface UpdateUserRequest {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
}

// ============ Wallet ============
export interface WalletBalance {
    bonk: number;
    dBonk: number;
    pendingRewards: number;
    withdrawableBonk: number;
}

export interface ActivateWalletRequest {
    txSignature: string;
}

export interface WithdrawRequest {
    amount: number;
}

export interface WithdrawRequestResponse {
    withdrawalId: string;
    amount: number;
    solFeeRequired: number;
    masterWalletAddress: string;
    expiresAt: string;
}

export interface WithdrawConfirmRequest {
    withdrawalId: string;
    feeTxSignature: string;
}

export interface PowerDownStartRequest {
    amount: number;
}

export interface PowerDownStatus {
    isActive: boolean;
    totalAmount: number;
    remainingAmount: number;
    weeklyPayout: number;
    weeksRemaining: number;
    nextPayoutAt?: string;
    startedAt?: string;
}

export interface PowerDownHistoryItem {
    id: string;
    week: number;
    amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    scheduledAt: string;
    completedAt?: string;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'laugh_sent' | 'laugh_received' | 'reward' | 'power_up' | 'power_down';
    amount: number;
    token: 'BONK' | 'dBONK';
    status: 'pending' | 'completed' | 'failed';
    description?: string;
    createdAt: string;
}

// ============ Meme ============
export interface Meme {
    id: string;
    creator: UserSummary;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    laughCount: number;
    loveCount: number;
    commentCount: number;
    saveCount: number;
    totalBonkReceived: number;
    isLoved?: boolean;
    isLaughed?: boolean;
    isSaved?: boolean;
    createdAt: string;
}

export interface UserSummary {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface CreateMemeRequest {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
}

export interface LaughRequest {
    amount: number;
}

export interface LaughResponse {
    success: boolean;
    newBalance: number;
    memeNewTotal: number;
}

// ============ Comment ============
export interface Comment {
    id: string;
    memeId: string;
    author: UserSummary;
    content: string;
    likeCount: number;
    replyCount: number;
    parentId?: string;
    isLiked?: boolean;
    createdAt: string;
}

export interface CreateCommentRequest {
    content: string;
    parentId?: string;
}

// ============ Rewards ============
export interface PendingRewards {
    creatorRewards: number;
    curatorRewards: number;
    referralRewards: number;
    total: number;
}

export interface ClaimRewardsResponse {
    claimed: number;
    newBalance: number;
}

export interface RewardHistoryItem {
    id: string;
    type: 'creator' | 'curator' | 'referral';
    amount: number;
    sourceId?: string;
    description: string;
    createdAt: string;
}

// ============ Social ============
export interface FollowResponse {
    following: boolean;
    followerCount: number;
}

// ============ Credits ============
export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    priceUsd: number;
    bonusCredits: number;
}

export interface CreditBalance {
    credits: number;
}

export interface PurchaseCreditsRequest {
    packageId: string;
    paymentMethod: string;
}

export interface CreditHistoryItem {
    id: string;
    type: 'purchase' | 'usage' | 'bonus';
    amount: number;
    description: string;
    createdAt: string;
}

// ============ Referral ============
export interface ReferralCode {
    code: string;
    url: string;
}

export interface ReferralStats {
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: number;
    pendingRewards: number;
}

// ============ Upload ============
export interface UploadResponse {
    url: string;
    key: string;
}

// ============ Feed Params ============
export interface FeedParams {
    page?: number;
    limit?: number;
}

export interface UserMemesParams extends FeedParams {
    username: string;
}

// ============ AI Generation ============
export type AIMediaType = 'image' | 'video' | 'gif';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerateAIRequest {
    prompt: string;
    mediaType: AIMediaType;
    duration?: number;
}

export interface GenerationResult {
    id: string;
    status: GenerationStatus;
    mediaType: AIMediaType;
    prompt: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    creditsCost: number;
    createdAt: string;
    completedAt?: string;
}
