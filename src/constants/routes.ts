export const ROUTES = {
    // Auth
    WELCOME: '/welcome',
    OAUTH_CALLBACK: '/auth/callback',
    REFERRAL: '/referral',
    SIGNUP: '/signup',
    ACTIVATE: '/activate',
    ACTIVATE_SUCCESS: '/activate/success',

    // Main
    HOME: '/',
    MEME_DETAIL: '/meme/:id',
    CREATE_MEME: '/create',

    // Earn/Wallet
    EARN: '/earn',
    DEPOSIT: '/earn/deposit',
    WITHDRAW: '/earn/withdraw',
    POWER_UP: '/earn/power-up',
    POWER_DOWN: '/earn/power-down',
    TRANSACTIONS: '/earn/transactions',

    // Profile
    PROFILE: '/profile',
    PROFILE_EDIT: '/profile/edit',
    PROFILE_SETTINGS: '/profile/settings',
    USER_PROFILE: '/user/:username',

    // Social
    FOLLOWERS: '/user/:username/followers',
    FOLLOWING: '/user/:username/following',

    // Other
    SAVED: '/saved',

    // Legal
    TERMS: '/terms',
    PRIVACY: '/privacy',

    SEARCH: '/search',
} as const;

// Helper to build dynamic routes
export const buildRoute = {
    memeDetail: (id: string) => `/meme/${id}`,
    userProfile: (username: string) => `/user/${username}`,
    followers: (username: string) => `/user/${username}/followers`,
    following: (username: string) => `/user/${username}/following`,
};