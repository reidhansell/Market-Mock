import React from 'react';
import { useNavigate } from 'react-router-dom';
import Portfolio from '../Home/Portfolio';
import Watchlist from '../Home/Watchlist';
import Quests from '../Home/Quests';
import './DashboardModule.css';
import User from '../../../../models/User';

interface Props {
    type: 'portfolio' | 'watchlist' | 'quests';
    user: User;
}

const DashboardModule: React.FC<Props> = ({ type, user }) => {
    const navigate = useNavigate();

    const getContent = () => {
        switch (type) {
            case 'portfolio':
                return <Portfolio user={user} />;
            case 'watchlist':
                return <Watchlist />;
            case 'quests':
                return <Quests />;
            default:
                return null;
        }
    };

    const toggleFullscreen = () => {
        navigate(type === 'portfolio' ? '/portfolio' : type === 'watchlist' ? '/watchlist' : '/quests');
    }

    return (
        <div className="dashboard-module" onClick={toggleFullscreen}>
            <h1 className="dashboard-module-header">
                {type === 'portfolio' ? 'Portfolio' : type === 'watchlist' ? 'Watchlist' : 'Quests'}
            </h1>
            {getContent()}
        </div>
    );
};

export default DashboardModule;