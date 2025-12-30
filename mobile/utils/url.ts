import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

/**
 * Constructs a full URL for an image path returned by the server.
 * Handles cases where the path might already be a full URL or is null/undefined.
 */
export const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    if (!BACKEND_URL) {
        console.warn('getImageUrl: BACKEND_URL is not defined in expoConfig.extra');
        return null;
    }

    // Ensure no double slashes
    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    const finalUrl = `${baseUrl}${cleanPath}`;
    return finalUrl;
};
