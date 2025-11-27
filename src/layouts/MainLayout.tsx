import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Coins, User, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

const navItems = [
    { path: ROUTES.HOME, icon: Home, label: 'Home' },
    { path: ROUTES.EARN, icon: Coins, label: 'Earn' },
    { path: ROUTES.PROFILE, icon: User, label: 'Profile' },
];

/**
 * Main app layout with bottom navigation
 */
export function MainLayout() {
    const location = useLocation();

    // Check if we're on create page (FAB should be highlighted)
    const isCreatePage = location.pathname === ROUTES.CREATE_MEME;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 pb-20 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
                <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
                    {/* Home */}
                    <NavItem item={navItems[0]} />

                    {/* Create FAB */}
                    <NavLink
                        to={ROUTES.CREATE_MEME}
                        className={cn(
                            'flex items-center justify-center w-14 h-14 -mt-6 rounded-full shadow-lg transition-all',
                            isCreatePage
                                ? 'bg-primary text-white'
                                : 'bg-secondary text-white hover:bg-secondary/90'
                        )}
                    >
                        <Plus className="w-7 h-7" />
                    </NavLink>

                    {/* Earn */}
                    <NavItem item={navItems[1]} />

                    {/* Profile */}
                    <NavItem item={navItems[2]} />
                </div>
            </nav>
        </div>
    );
}

interface NavItemProps {
    item: {
        path: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
    };
}

function NavItem({ item }: NavItemProps) {
    const Icon = item.icon;

    return (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                cn(
                    'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                    isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                )
            }
        >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
        </NavLink>
    );
}