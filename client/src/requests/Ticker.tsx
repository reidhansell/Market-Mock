import axios from 'axios';
import config from '../config.json';
import Ticker from '../../../models/Ticker';

export const searchTickers = async (companyName: string): Promise<Ticker[]> => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`${config.serverURL}/api/ticker/search/${companyName}`);
        return response.data.tickers;
    } catch (error: any) {
        throw error.response.data.error;
    }
};
