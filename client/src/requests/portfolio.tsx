import Axios, { AxiosResponse } from 'axios';
import config from '../config.json';
import NetWorthData from '../../../models/NetWorthData';

export const getUserNetWorthData = async (): Promise<NetWorthData[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/portfolio/`);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

