import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Layouts
import { AuthLayout, MainLayout } from '@/layouts';

// Guards
import { AuthGuard, ActivatedGuard, GuestGuard } from '@/components/guards';

// Auth Pages
import {
    WelcomePage,
    OAuthCallbackPage,
    ReferralPage,
    SignupPage,
    ActivatePage,
    ActivateSuccessPage,
} from '@/pages/auth';

// Main Pages
import { HomePage } from '@/pages/home/HomePage';
import { MemeDetailPage, CreateMemePage } from '@/pages/meme';
import {
    EarnPage,
    DepositPage,
    WithdrawPage,
    PowerUpPage,
    PowerDownPage,
    TransactionsPage,
} from '@/pages/earn';
import {
    ProfilePage,
    EditProfilePage,
    SettingsPage,
    UserProfilePage,
} from '@/pages/profile';
import { SavedPage } from '@/pages/saved/SavedPage';
import { FollowersPage, FollowingPage } from '@/pages/social';

// Legal
import { TermsPage } from '@/pages/legal/TermsPage';

export const router = createBrowserRouter([
    // ============ Auth Routes (Guest Only) ============
    {
        element: (
            <GuestGuard>
                <AuthLayout />
            </GuestGuard>
        ),
        children: [
            { path: ROUTES.WELCOME, element: <WelcomePage /> },
            { path: ROUTES.REFERRAL, element: <ReferralPage /> },
            { path: ROUTES.SIGNUP, element: <SignupPage /> },
        ],
    },

    // ============ OAuth Callback (No Guard - handles its own redirect) ============
    {
        path: ROUTES.OAUTH_CALLBACK,
        element: <OAuthCallbackPage />,
    },

    // ============ Activation Routes (Auth but not activated) ============
    {
        element: (
            <AuthGuard>
                <AuthLayout />
            </AuthGuard>
        ),
        children: [
            { path: ROUTES.ACTIVATE, element: <ActivatePage /> },
            { path: ROUTES.ACTIVATE_SUCCESS, element: <ActivateSuccessPage /> },
        ],
    },

    // ============ Main App Routes (Auth + Activated) ============
    {
        element: (
            <AuthGuard>
                <ActivatedGuard>
                    <MainLayout />
                </ActivatedGuard>
            </AuthGuard>
        ),
        children: [
            // Home
            { path: ROUTES.HOME, element: <HomePage /> },

            // Meme
            { path: ROUTES.MEME_DETAIL, element: <MemeDetailPage /> },
            { path: ROUTES.CREATE_MEME, element: <CreateMemePage /> },

            // Earn/Wallet
            { path: ROUTES.EARN, element: <EarnPage /> },
            { path: ROUTES.DEPOSIT, element: <DepositPage /> },
            { path: ROUTES.WITHDRAW, element: <WithdrawPage /> },
            { path: ROUTES.POWER_UP, element: <PowerUpPage /> },
            { path: ROUTES.POWER_DOWN, element: <PowerDownPage /> },
            { path: ROUTES.TRANSACTIONS, element: <TransactionsPage /> },

            // Profile
            { path: ROUTES.PROFILE, element: <ProfilePage /> },
            { path: ROUTES.PROFILE_EDIT, element: <EditProfilePage /> },
            { path: ROUTES.PROFILE_SETTINGS, element: <SettingsPage /> },

            // User Profile (public)
            { path: ROUTES.USER_PROFILE, element: <UserProfilePage /> },
            { path: ROUTES.FOLLOWERS, element: <FollowersPage /> },
            { path: ROUTES.FOLLOWING, element: <FollowingPage /> },

            // Saved
            { path: ROUTES.SAVED, element: <SavedPage /> },
        ],
    },

    // ============ Public Routes ============
    { path: ROUTES.TERMS, element: <TermsPage /> },
    { path: ROUTES.PRIVACY, element: <TermsPage /> }, // Reuse for now

    // ============ Fallback ============
    { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
]);