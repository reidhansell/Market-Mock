import Axios, { AxiosResponse } from 'axios';
import config from '../config.json';
import Notification from '../../../models/Notification';

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/notification/`);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
}

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    try {
        Axios.defaults.withCredentials = true;
        Axios.put(`${config.serverURL}/api/notification/${notificationId}`);
        return;
    } catch (error: any) {
        throw error.response.data.error;
    }
}