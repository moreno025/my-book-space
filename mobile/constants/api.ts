import Constants from 'expo-constants';
import axios from "axios";

const API_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const authApi = {
    login: async (email: string, password: string) => {
        return axios.post(`${API_URL}/auth/login`, { email, password });
    },
    register: async (data: any) => {
        return axios.post(`${API_URL}/auth/register`, data);
    },
    forgotPassword: async (email: string) => {
        return axios.post(`${API_URL}/auth/forgot-password`, { email });
    },
};


