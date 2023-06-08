import axios from 'axios';
import config from '../config.json';

export const login = async (email, password) => {
    try {
        const response = await axios.post(config.serverURL + '/api/auth/login', { email, password });

        // After successfully logging in, store the access token in local storage.
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.error("No token found");
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
        console.log(error);
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await axios.post(`/api/auth/verify/${token}`);
        return response
    } catch (error) {
        console.error('Verification error:', error);
    }
};