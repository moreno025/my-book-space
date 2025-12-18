import Constants from 'expo-constants';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API_URL = Constants.expoConfig?.extra?.BACKEND_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const authApi = {
    login: async (email: string, password: string) => {
        return api.post(`${API_URL}/auth/login`, { email, password });
    },
    register: async (data: any) => {
        return api.post(`${API_URL}/auth/register`, data);
    },
    forgotPassword: async (email: string) => {
        return api.post(`${API_URL}/auth/forgot-password`, { email });
    },
    updatePassword: async (data: { token: string; newPassword: string }) => {
        return api.post(`${API_URL}/auth/update-password`, data);
    },
};

export const booksApi = {
    searchBooks: (query: string, signal?: AbortSignal) =>
        api.get(`${API_URL}/book/search`, { params: { q: query }, signal }),

    saveHistory: (query: string) =>
        api.post(`${API_URL}/book/search/history`, { query }),

    getHistory: () =>
        api.get(`${API_URL}/book/search/history`),

    clearHistory: () =>
        api.delete(`${API_URL}/book/search/history`),

    deleteHistoryItem: (query: string) =>
        api.delete(`${API_URL}/book/search/history/${query}`),
};

console.log(API_URL);



