import axios from "axios";
import Constants from "expo-constants";
import { getItem, setItem, removeItem } from "../../utils/storage";
import { authEvents, AUTH_EVENTS } from "../../utils/authEvents";

const API_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const privateApi = axios.create({
    baseURL: API_URL,
});

privateApi.interceptors.request.use(async (config) => {
    const token = await getItem("token");
    if (!token) {
        // Evita que la petición se envíe si no hay token
        return Promise.reject(new Error("CANCEL_NO_TOKEN"));
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = "Bearer " + token;
                        return privateApi(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    { refreshToken }
                );

                const newToken = res.data.token;
                await setItem("token", newToken);

                authEvents.emit(AUTH_EVENTS.TOKEN_REFRESHED, newToken);

                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return privateApi(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await removeItem("token");
                await removeItem("refreshToken");
                await removeItem("user");

                authEvents.emit(AUTH_EVENTS.SESSION_EXPIRED);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);





