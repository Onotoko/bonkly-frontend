import { Outlet } from 'react-router-dom';

/**
 * Layout for auth pages (Welcome, Referral, Signup, Activate)
 * No bottom navigation, full screen
 */
export function AuthLayout() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Logo Header */}
            <header className="p-4 flex justify-center">
                <img
                    src="/logo.svg"
                    alt="Bonkly"
                    className="h-8"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            {/* Footer - Terms link */}
            <footer className="p-4 text-center">
                <p className="text-xs text-gray-400">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-primary underline">
                        Terms
                    </a>
                    . Which you obviously didn't read.
                </p>
            </footer>
        </div>
    );
}