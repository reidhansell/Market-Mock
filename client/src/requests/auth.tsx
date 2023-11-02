import Axios, { AxiosResponse } from 'axios';
import config from '../config.json';
import User from '../../../models/User'

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
        token?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface resetData {
    starting_amount: number;
}

export const login = async (email: string, password: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await Axios.post<ResponseData>(`${config.serverURL}/api/auth/login`, {
            email,
            password,
        } as LoginData);

        if (response.data && response.data.token) {
            Axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            localStorage.setItem('token', response.data.token);
        }

        return response;
    } catch (error: any) {
        throw error.response.data.error; /*  Specific to Axios  */
    }
};

export const register = async (username: string, email: string, password: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await Axios.post<ResponseData>('/api/auth/register', { username, email, password } as RegisterData);
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const verifyEmail = async (token: string): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await Axios.post<ResponseData>(`/api/auth/verify/${token}`);
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const logout = async (): Promise<AxiosResponse<ResponseData>> => {
    try {
        localStorage.removeItem('token');
        delete Axios.defaults.headers.common['Authorization'];
        const response = await Axios.post<ResponseData>('/api/auth/session/logout');
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
};

export const refreshToken = async (): Promise<AxiosResponse<ResponseData>> => {
    try {
        const response = await Axios.get<ResponseData>('/api/auth/session/refresh_token');
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
}

export const getUser = async (): Promise<AxiosResponse<User>> => {
    try {
        const token = localStorage.getItem('token');
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        Axios.defaults.headers.common['Access-Control-Allow-Origin'] = config.serverURL;
        Axios.defaults.withCredentials = true;
        const response = await Axios.get<User>('/api/auth/');
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
}

export const resetProgress = async (): Promise<AxiosResponse<void>> => {
    try {
        const response = await Axios.post<void>('/api/auth/reset_progress', { starting_amount: 10000 } as resetData);
        return response;
    } catch (error: any) {
        throw error.response.data.error;
    }
}