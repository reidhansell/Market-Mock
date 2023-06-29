import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
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
                <div className="user-icon" onClick={toggleUserMenu}>
                    <FontAwesomeIcon icon={faUser} />
                </div>
                {showUserMenu && (
                    <ul className="user-menu">
                        <Link to="/watchlist"><li>Watchlist</li></Link>
                        <Link to="/profile"><li>Profile</li></Link>
                        <Link to="/login" onClick={handleLogout}><li >Signout</li></Link>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navigation;

