import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../requests/auth';
import './Nav.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Common/UserProvider';
import logo from '../../../android-chrome-192x192.png';

interface NavProps {
    setAuth: (auth: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ setAuth }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLUListElement>(null);
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

    const toggleUserMenu = () => {
        setShowUserMenu((prevShowUserMenu) => !prevShowUserMenu);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) { // Node refers to an HTML element, not Node.js
            setShowUserMenu(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav>
            <div className="logo-container">
                <Link to="/">
                    <img src={logo} alt="logo" className="logo-nav" />
                    <span style={{ color: "var(--brand)" }}>M</span>ARKET <span style={{ color: "var(--brand)" }}>M</span>OCK
                </Link>
            </div>
            <div className="user-menu-container">
                <div className="icon-wrapper" onClick={toggleUserMenu}>
                    <div className="bars-icon" />
                </div>
                {showUserMenu && (
                    <ul ref={userMenuRef} className="user-menu">
                        <Link to="/portfolio"><li>Portfolio</li></Link>
                        <Link to="/watchlist"><li>Watchlist</li></Link>
                        <Link to="/tickersearch"><li>Search</li></Link>
                        <Link to="/quests"><li>Quests</li></Link>
                        {user?.user_id === 1 ? <Link to="/admin"><li>Admin</li></Link> : null}
                        <Link to="/login" onClick={handleLogout}><li >Signout</li></Link>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navigation;

