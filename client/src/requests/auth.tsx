import axios, { AxiosResponse } from 'axios';
import config from '../config.json';

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface ResponseData {
    data: {
        accessToken?: string;
    };
    [key: string]: any;
}

export const login = async (email: string, password: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        axios.defaults.withCredentials = true;
        const response = await axios.post<ResponseData>(`${config.serverURL}/api/auth/login`, {
            email,
            password,
        });

        if (response.data && response.data.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            axios.defaults.headers.common['Access-Control-Allow-Origin'] = config.serverURL;

            console.log('Login successful');
        }

        return response;
    } catch (error: any) {
        throw error.response.data.error; /*  Specific to Axios  */
    }
};

export const register = async (username: string, email: string, password: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await axios.post<ResponseData>('/api/auth/register', { username, email, password } as RegisterData);
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const verifyEmail = async (token: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await axios.post<ResponseData>(`/api/auth/verify/${token}`);
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const logout = async (): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await axios.post<ResponseData>('/api/auth/session/logout');
        console.log('Logout successful');
        delete axios.defaults.headers.common['Authorization'];
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};
