import React, { useEffect, useContext } from 'react';
import DashboardModule from '../Common/DashboardModule';
import './Home.css';
import { getNotifications } from '../../requests/notification';
import { UserContext } from '../Common/UserProvider';

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
            <DashboardModule type="portfolio" />
            <DashboardModule type="watchlist" />
            <DashboardModule type="quests" />
        </div>
    );
};

export default Home;