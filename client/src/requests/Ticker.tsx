import axios from 'axios';
import config from '../config.json';
import Ticker from '../../../models/Ticker';
import TickerEndOfDay from '../../../models/TickerEndOfDay';
import TickerIntraday from '../../../models/TickerIntraday';

export const searchTickers = async (searchTerm: string): Promise<Ticker[]> => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`${config.serverURL}/api/ticker/search/${searchTerm}`);
        return response.data.tickers;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const getTickerData = async (symbol: string, viewMode: "EOD" | "intraday"): Promise<TickerEndOfDay[] | TickerIntraday[]> => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`${config.serverURL}/api/ticker/${viewMode}/${symbol}`);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
}