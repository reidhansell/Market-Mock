import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AlertContext } from '../Common/AlertContext';
import './Nav.css';

const Navigation = (props) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const addAlert = useContext(AlertContext);

    const handleLogout = async () => {
        try {
            let response = await logout();
            if (response.status === 200) {
                props.setAuth(false);
            }
        } catch (error) {
            addAlert(error || 'An error occurred during logout');
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

