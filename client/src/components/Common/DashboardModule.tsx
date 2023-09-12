import React from 'react';
import { useNavigate } from 'react-router-dom';
import Portfolio from '../Home/Portfolio';
import Watchlist from '../Home/Watchlist';
import Quests from '../Home/Quests';
import './DashboardModule.css';

interface Props {
    type: 'portfolio' | 'watchlist' | 'quests';
}

const DashboardModule: React.FC<Props> = ({ type }) => {
    const navigate = useNavigate();

    const getContent = () => {
        switch (type) {
            case 'portfolio':
                return <Portfolio />;
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
        <div className="dashboard-module">
            {getContent()}
            <button onClick={toggleFullscreen}>Toggle Fullscreen</button>
        </div>
    );
};

export default DashboardModule;