import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const publicApi = axios.create({
    baseURL: API_URL,
});



