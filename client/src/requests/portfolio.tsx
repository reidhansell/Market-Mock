import Axios from 'axios';
import config from '../config.json';
import NetWorthData from '../../../models/NetWorthData';
import { UserStockWithPrices } from '../../../models/UserStock';

interface PortfolioDataResponse {
    netWorthData: NetWorthData[];
    userStocks: UserStockWithPrices[];
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

