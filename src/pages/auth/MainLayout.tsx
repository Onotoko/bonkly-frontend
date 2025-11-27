import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Wallet, User } from 'lucide-react';

const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/wallet', label: 'Earn', icon: Wallet },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function MainLayout() {
    const location = useLocation();

    // Hide bottom nav on certain pages (e.g., create meme full screen)
    const hideNavPaths = ['/create', '/meme/'];
    const shouldHideNav = hideNavPaths.some((p) => location.pathname.startsWith(p));

    return (
        <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
            {/* Main content area */}
            <main className={`flex-1 ${shouldHideNav ? '' : 'pb-20'}`}>
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            {!shouldHideNav && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white">
                    {/* Safe area padding for iOS */}
                    <div className="flex h-16 items-center justify-around px-6 pb-safe">
                        {navItems.map(({ path, label, icon: Icon }) => {
                            const isActive = location.pathname === path ||
                                (path === '/home' && location.pathname === '/');

                            return (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className="flex flex-col items-center justify-center gap-1"
                                >
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive
                                                ? 'bg-[#E53935] text-white'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${isActive ? 'text-[#E53935]' : 'text-gray-400'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}