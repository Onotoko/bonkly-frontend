import { Outlet } from 'react-router-dom';

/**
 * Layout for auth pages (Welcome, Referral, Signup, Activate)
 * No bottom navigation, full screen
 * Each page handles its own header/footer
 */
export function AuthLayout() {
    return (
        <main className="min-h-screen min-h-dvh">
            <Outlet />
        </main>
    );
}