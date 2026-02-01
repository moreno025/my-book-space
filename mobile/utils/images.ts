import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('file://')) return path;
    if (path.startsWith('/')) return `${API_URL}${path}`;
    return `${API_URL}/${path}`;
};
