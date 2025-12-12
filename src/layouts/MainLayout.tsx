import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Icons
import iconHomeDefault from '@/assets/icons/icon-home-default.svg';
import iconHomeActive from '@/assets/icons/icon-home-active.svg';
import iconEarnDefault from '@/assets/icons/icon-earn-default.svg';
import iconEarnActive from '@/assets/icons/icon-earn-active.svg';
import iconProfileDefault from '@/assets/icons/icon-profile-default.svg';
import iconProfileActive from '@/assets/icons/icon-profile-active.svg';

const navItems = [
    {
        path: ROUTES.HOME,
        label: 'Home',
        iconDefault: iconHomeDefault,
        iconActive: iconHomeActive,
    },
    {
        path: ROUTES.EARN,
        label: 'Earn',
        iconDefault: iconEarnDefault,
        iconActive: iconEarnActive,
    },
    {
        path: ROUTES.PROFILE,
        label: 'Profile',
        iconDefault: iconProfileDefault,
        iconActive: iconProfileActive,
    },
];

export function MainLayout() {
    const location = useLocation();

    return (
        <div className="main-layout">
            {/* Main Content */}
            <main className="main-content has-nav">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">
                                    <img
                                        src={isActive ? item.iconActive : item.iconDefault}
                                        alt=""
                                    />
                                </span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}