import React, { useEffect, useContext } from 'react';
import DashboardModule from '../Common/DashboardModule';
import './Home.css';
import { getNotifications } from '../../requests/notification';
import { UserContext } from '../Common/UserProvider';
import Portfolio from './Portfolio';
import Watchlist from './Watchlist';
import Quests from './Quests';

const Home: React.FC = () => {

    const { setNotifications } = useContext(UserContext);

    useEffect(() => {
        const getData = async () => {
            try {
                const notificationData = await getNotifications();
                setNotifications(notificationData);
            } catch (error: any) {
                console.log(error);
            }
        }
        getData();
    }, []);

    return (
        <div className="home-container">
            <DashboardModule title="Portfolio" content={<Portfolio fullscreen={false} />} />
            <DashboardModule title="Watchlist" content={<Watchlist />} />
            <DashboardModule title="Quests" content={<Quests />} />
        </div>
    );
};

export default Home;