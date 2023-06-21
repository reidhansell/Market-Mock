import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AlertContext } from '../Common/AlertContext'
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
                <Link to="/">Market Mock</Link>
            </div>
            <div className="user-menu-container">
                <div className="user-icon" onClick={toggleUserMenu}>
                    <FontAwesomeIcon icon={faUser} />
                </div>
                {showUserMenu && (
                    <ul className="user-menu">
                        <li>
                            <Link to="/watchlist">Watchlist</Link>
                        </li>
                        <li>
                            <Link to="/profile">Profile</Link>
                        </li>
                        <li onClick={handleLogout}>
                            <Link to="/login">Signout</Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
