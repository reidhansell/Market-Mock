import React from 'react';
import DashboardModule from '../Common/DashboardModule';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <DashboardModule type="portfolio" />
            <DashboardModule type="watchlist" />
            <DashboardModule type="quests" />
        </div>
    );
};

export default Home;