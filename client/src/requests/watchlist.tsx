import Axios from 'axios';
import config from '../config.json';
import WatchList from '../../../models/WatchList';

export const getWatchlist = async (userId: number): Promise<WatchList[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/watchlist`);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};