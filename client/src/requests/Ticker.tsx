import axios from 'axios';
import config from '../config.json';
import Tickers from '../../../models/Ticker';

export interface ResponseData {
    data: {
        tickers: Tickers[];
    };
    [key: string]: any;
}

export const searchTickers = async (companyName: string): Promise<Tickers[]> => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.get<ResponseData>(`${config.serverURL}/api/ticker/search/${companyName}`);
        return response.data.tickers;
    } catch (error: any) {
        throw error.response.data.error;
    }
};
