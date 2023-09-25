import Axios from 'axios';
import config from '../config.json';
import WatchList from '../../../models/WatchList';

export const getWatchlist = async (): Promise<WatchList[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/watchlist`);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const addTickerToWatchlist = async (tickerSymbol: string): Promise<void> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.post(`${config.serverURL}/api/watchlist/add/${tickerSymbol}`);
        console.log('Ticker added to watchlist:', response.data);
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const removeTickerFromWatchlist = async (tickerSymbol: string): Promise<void> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.delete(`${config.serverURL}/api/watchlist/remove/${tickerSymbol}`);
        console.log('Ticker removed from watchlist:', response.data);
    } catch (error: any) {
        throw error.response.data.error;
    }
};