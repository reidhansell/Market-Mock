import Axios from 'axios';
import config from '../config.json';
import { UserQuest } from '../../models/Quest';

export const getUserQuests = async (): Promise<UserQuest[]> => {
    try {
        Axios.defaults.withCredentials = true;
        const response = await Axios.get(`${config.serverURL}/api/quest/`);
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

