import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/auth';
import './Nav.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Common/UserProvider';

interface NavProps {
    setAuth: (auth: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ setAuth }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

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

    const toggleUserMenu = () => {
        setShowUserMenu((prevShowUserMenu) => !prevShowUserMenu);
    };

    return (
        <nav>
            <div className="logo-container">
                <Link to="/">
                    <img src="../../android-chrome-192x192.png" alt="logo" className="logo-nav" />
                    <span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK
                </Link>
            </div>
            <div className="user-menu-container">
                <div className="icon-wrapper" onClick={toggleUserMenu}>
                    <div className="bars-icon" />
                </div>
                {showUserMenu && (
                    <ul className="user-menu">
                        <Link to="/portfolio"><li>Portfolio</li></Link>
                        <Link to="/watchlist"><li>Watchlist</li></Link>
                        <Link to="/tickersearch"><li>Search</li></Link>
                        <Link to="/quests"><li>Quests</li></Link>
                        <Link to="/login" onClick={handleLogout}><li >Signout</li></Link>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navigation;

