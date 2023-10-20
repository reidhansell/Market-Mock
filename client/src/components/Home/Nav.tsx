import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/auth';
import './Nav.css';

interface NavProps {
    setAuth: (auth: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ setAuth }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setAuth(false);
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
                <Link to="/"><span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK</Link>
            </div>
            <div className="user-menu-container">
                <div className="icon-wrapper" onClick={toggleUserMenu}>
                    <div className="bars-icon" />
                </div>
                {showUserMenu && (
                    <ul className="user-menu">
                        <Link to="/portfolio"><li>Portfolio</li></Link>
                        <Link to="/watchlist"><li>Watchlist</li></Link>
                        <Link to="/quests"><li>Quests</li></Link>
                        <Link to="/login" onClick={handleLogout}><li >Signout</li></Link>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navigation;

