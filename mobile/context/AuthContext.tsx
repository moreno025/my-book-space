import { createContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";
import { api, authApi, booksApi, userApi } from "../constants/api/index";
import { authEvents, AUTH_EVENTS } from "../utils/authEvents";
import { User } from "../types/user";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (values: any) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUserProfile: (data: FormData) => Promise<boolean>;
    refreshUser: (username: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => false,
    register: async () => false,
    logout: async () => { },
    updateUserProfile: async () => false,
    refreshUser: async (username: string) => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSession() {

            try {
                const savedToken = await getItem("token");
                const savedUser = await getItem("user");

                if (savedToken && savedUser) {
                    const parsedUser = JSON.parse(savedUser);

                    if (parsedUser && parsedUser.id && parsedUser.email) {
                        api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

                        try {
                            console.log("Session validation: checking history...");
                            await booksApi.getHistory();
                            console.log("Session validation: success");

                            setToken(savedToken);
                            setUser(parsedUser);
                        } catch (error: any) {
                            console.error("Session validation error:", error.message, error.response?.status);
                            if (error.response?.status !== 401) {
                                setToken(savedToken);
                                setUser(parsedUser);
                            }
                        }
                    } else {
                        console.log("Invalid parsed user:", parsedUser);
                        await removeItem("user");
                        await removeItem("token");
                    }
                }
            } catch (err) {
                console.error("🔒 [AuthContext] Critical error in loadSession:", err);
            } finally {
                setLoading(false);
            }
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

    async function updateUserProfile(data: FormData) {
        try {
            const res = await authApi.updateProfile(data);
            if (res.status === 200) {
                const { user: updatedUser } = res.data;
                const newUser = { ...user, ...updatedUser };

                setUser(newUser);
                await setItem("user", JSON.stringify(newUser));
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("Error updating profile:", error);
            if (error.response) {
                console.error("Server response:", error.response.status, error.response.data);
            }
            return false;
        }
    }

    const refreshUser = useCallback(async (username: string) => {
        try {
            const res = await userApi.getUserByUsername(username);
            if (res.status === 200) {
                const updatedUser = res.data;
                setUser(prev => {
                    const newUser = { ...prev!, ...updatedUser };
                    // Avoid update if data is identical to prevent infinite loops
                    if (JSON.stringify(prev) === JSON.stringify(newUser)) {
                        return prev;
                    }
                    setItem("user", JSON.stringify(newUser)).catch(err => console.error("Failed to save user", err));
                    return newUser;
                });
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
