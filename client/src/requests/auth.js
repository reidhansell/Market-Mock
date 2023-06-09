import axios from 'axios';
import config from '../config.json';

export const login = async (email, password) => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.post(config.serverURL + '/api/auth/login', {
            email,
            password,
        });

        if (response.data && response.data.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            axios.defaults.headers.common['Access-Control-Allow-Origin'] = config.serverURL;

            console.log('Login successful');
        }

        return response;
    } catch (error) {
        throw error.response.data.error;
    }
};



export const register = async (username, email, password) => {
    try {
        const response = await axios.post('/api/auth/register', { username, email, password });
        return response
    } catch (error) {
        throw error.response.data.error;
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await axios.post(`/api/auth/verify/${token}`);
        return response
    } catch (error) {
        throw error.response.data.error;
    }
};