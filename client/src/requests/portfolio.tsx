import Axios, { AxiosResponse } from 'axios';
import config from '../config.json';
import NetWorthData from '../../../models/NetWorthData';
import User_Stock from '../../../models/User_Stock';

interface PortfolioDataResponse {
    netWorthData: NetWorthData[];
    userStocks: User_Stock[];
}

export const getUserPortfolio = async (): Promise<PortfolioDataResponse> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/portfolio/`);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

