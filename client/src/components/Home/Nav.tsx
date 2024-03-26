import React, { useContext } from 'react';
import { TopNavigation, TopNavigationProps } from '../../../theme/build/components/index';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserProvider';
import { logout } from '../../requests/auth';

interface NavProps {
    setAuth: (auth: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ setAuth }) => {
    const navigate = useNavigate();
    const { setUser, user } = useContext(UserContext);

    const handleLogout = async () => {
        try {
            await logout();
            setAuth(false);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    let dropdownItems = [
        { id: "portfolio", text: 'Portfolio' },
        { id: "watchlist", text: 'Watchlist' },
        { id: "tickersearch", text: 'Search' },
        { id: "quests", text: 'Quests' },
        { id: "signout", text: 'Sign Out' }
    ];

    if (user?.user_id === 1) {
        dropdownItems = [...dropdownItems, { id: "admin", text: 'Admin' }];
    }

    let utilities: TopNavigationProps.Utility[] = [{
        type: "menu-dropdown",
        text: "Menu",
        items: dropdownItems,
        onItemClick: (item: any) => {
            if (item.detail.id === 'signout') {
                handleLogout();
            } else {
                navigate(`/${item.detail.id}`);
            }
        }
    }];

    return (
        <div style={{ borderBottom: "solid 1px white", zIndex: "1000", width: "100vw", top: "0", position: "fixed" }}>
            <TopNavigation
                identity={{
                    href: '/',
                    title: 'Market Mock',
                    logo: {
                        src: '../../../logo/safari-pinned-tab.svg',
                        alt: 'Logo'
                    },
                }}
                utilities={utilities}
            />
        </div>
    );
};

export default Navigation;
