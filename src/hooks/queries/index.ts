// Query keys
export { queryKeys } from './keys';

// Auth hooks
export {
    useGoogleLogin,
    useAppleLogin,
    useValidateReferral,
    useCompleteSignup,
    useActivateAccount,
    useLogout,
} from './useAuth';

// User hooks
export {
    useProfile,
    useBalances,
    useUserByUsername,
    useUpdateProfile,
} from './useUser';

// Wallet hooks
export {
    useWalletBalance,
    useTransactions,
    useRequestWithdraw,
    useConfirmWithdraw,
    useCancelWithdraw,
    useWithdrawRequests,
    usePowerDownStatus,
    usePowerDownHistory,
    useStartPowerDown,
    useCancelPowerDown,
} from './useWallet';

// Meme hooks
export {
    useMeme,
    useUserMemes,
    useFeedNew,
    useFeedTrending,
    useFeedForYou,
    useSavedMemes,
    useCreateMeme,
    useDeleteMeme,
    useLoveMeme,
    useLaughMeme,
    useToggleSaveMeme,
} from './useMemes';

// Comments hooks
export {
    useComments,
    useReplies,
    useCreateComment,
    useDeleteComment,
    useToggleLikeComment,
} from './useComments';

// Social hooks
export {
    useFollowers,
    useFollowing,
    useIsFollowing,
    useFollow,
    useUnfollow,
} from './useSocial';

// Rewards hooks
export {
    usePendingRewards,
    useClaimRewards,
} from './useRewards';

// Credits hooks
export {
    useCreditPackages,
    useCreditBalance,
    useCreditHistory,
    usePurchaseCredits,
} from './useCredits';

// Referrals hooks
export {
    useReferralStats,
    useValidateReferralCode,
    useReferralLeaderboard,
} from './useReferrals';

// Upload hooks
export {
    useUploadMedia,
    useUploadAvatar,
} from './useUpload';

// AI hooks
export {
    useGenerateAI,
    useAIStatus,
} from './useAI';