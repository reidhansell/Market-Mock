import React from 'react';
import Nav from './Nav';
import DashboardModule from '../Common/DashboardModule';
import './Home.css';

interface HomeProps {
    setAuth: (auth: boolean) => void;
}

const Home: React.FC<HomeProps> = ({ setAuth }) => {
    return (
        <>
            <Nav setAuth={setAuth} />
            <div className="container">
                <DashboardModule type="portfolio" />
                <DashboardModule type="watchlist" />
                <DashboardModule type="quests" />
            </div>
        </>
    );
};

export default Home;