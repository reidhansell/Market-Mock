import React, { useEffect, useContext } from 'react';
import { getNotifications } from '../../requests/notification';
import { UserContext } from '../../UserProvider';
import Portfolio from './Portfolio';
import Watchlist from './Watchlist';
import Quests from './Quests';
import { ColumnLayout } from '../../../theme/build/components/index';

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
        <ColumnLayout columns={3} minColumnWidth={420}>
            <Portfolio fullscreen={false} />
            <Watchlist fullscreen={false} />
            <Quests fullscreen={false} />
        </ColumnLayout>
    );
};

export default Home;