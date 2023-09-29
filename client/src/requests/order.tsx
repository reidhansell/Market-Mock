import Axios, { AxiosResponse } from 'axios';
import config from '../config.json';
import Order from '../../../models/Order';

export const getUserOrders = async (): Promise<Order[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/order/`);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.post(`${config.serverURL}/api/order/`, {
            ...orderData
        });
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};
