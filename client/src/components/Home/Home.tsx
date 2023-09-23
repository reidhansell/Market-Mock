import React from 'react';
import DashboardModule from '../Common/DashboardModule';
import './Home.css';
import User from '../../../../models/User';

interface HomeProps {
    user: User
}

const Home: React.FC<HomeProps> = ({ user }) => {
    return (
        <>
            <div className="home-container">
                <DashboardModule type="portfolio" user={user} />
                <DashboardModule type="watchlist" user={user} />
                <DashboardModule type="quests" user={user} />
            </div>
        </>
    );
};

export default Home;