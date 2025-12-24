import { createContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";
import { api, authApi } from "../constants/api/index";
import { authEvents, AUTH_EVENTS } from "../utils/authEvents";
import { User } from "../types/user";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (values: any) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => false,
    register: async () => false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSession() {
            const savedToken = await getItem("token");
            const savedUser = await getItem("user");

            if (savedToken && savedUser) {
                api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }

            setLoading(false);
        }

        loadSession();
    }, []);


    useEffect(() => {
        const onSessionExpired = () => {
            setUser(null);
            setToken(null);
        };

        authEvents.on(AUTH_EVENTS.SESSION_EXPIRED, onSessionExpired);

        return () => {
            authEvents.off(AUTH_EVENTS.SESSION_EXPIRED, onSessionExpired);
        };
    }, []);

    useEffect(() => {
        const onTokenRefreshed = (newToken: string) => {
            setToken(newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        };

        authEvents.on(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);

        return () => {
            authEvents.off(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);
        };
    }, []);

    async function login(email: string, password: string) {
        const res = await authApi.login(email, password);

        const { token, user, refreshToken } = res.data;

        if (!token || !refreshToken) {
            console.error("Token o refresh token faltante");
            return false;
        }

        await setItem("token", token);
        await setItem("refreshToken", refreshToken);
        await setItem("user", JSON.stringify(user));

        setToken(token);
        setUser(user);

        return true;
    }

    async function register(values: any) {
        const res = await authApi.register(values);
        return res.status === 200 || res.status === 201;
    }

    async function logout() {
        const refreshToken = await getItem("refreshToken");

        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch { }
        }

        setUser(null);
        setToken(null);

        await removeItem("token");
        await removeItem("refreshToken");
        await removeItem("user");
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}