import { createContext, useState, useEffect, useCallback, useContext } from "react";
import i18n from "../i18n"; // Import i18n configuration
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
    changeLanguage: (lang: 'en' | 'es') => Promise<void>;
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
    changeLanguage: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<{ user: User | null, token: string | null }>({ user: null, token: null });
    const [loading, setLoading] = useState(true);

    const user = session.user;
    const token = session.token;

    const setUser = useCallback((u: User | null | ((prev: User | null) => User | null)) => {
        setSession(prev => ({ ...prev, user: typeof u === 'function' ? u(prev.user) : u }));
    }, []);

    const setToken = useCallback((t: string | null | ((prev: string | null) => string | null)) => {
        setSession(prev => ({ ...prev, token: typeof t === 'function' ? t(prev.token) : t }));
    }, []);

    const setAuthState = useCallback((newToken: string | null, newUser: User | null) => {
        setSession({ token: newToken, user: newUser });
    }, []);

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
                            await booksApi.getHistory();

                            if (parsedUser.language) {
                                i18n.changeLanguage(parsedUser.language);
                            }

                            setAuthState(savedToken, parsedUser);
                            // Handle errors
                        } catch (error: any) {
                            if (error.response?.status === 401) {
                                // Expected behavior for expired tokens
                                console.log("🔒 [AuthContext] Session expired (401), clearing credentials.");
                            } else {
                                // Unexpected errors (network, server 500, etc)
                                console.error("🔒 [AuthContext] Unexpected session validation error:", {
                                    message: error.message,
                                    status: error.response?.status,
                                    url: error.config?.url
                                });
                            }
                            if (error.response?.status !== 401) {
                                // If it's not a 401 (e.g. timeout, 500), we might still want to keep the session
                                // but we should be careful. For now, let's keep the existing logic.
                                console.log("🔒 [AuthContext] Non-401 error, retaining session for resilience");
                                setAuthState(savedToken, parsedUser);
                            } else {
                                console.log("🔒 [AuthContext] 401 error during validation, clearing session");
                                await removeItem("token");
                                await removeItem("user");
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
    }, [setAuthState]);


    useEffect(() => {
        const onSessionExpired = () => {
            setAuthState(null, null);
        };

        authEvents.on(AUTH_EVENTS.SESSION_EXPIRED, onSessionExpired);

        return () => {
            authEvents.off(AUTH_EVENTS.SESSION_EXPIRED, onSessionExpired);
        };
    }, [setAuthState]);

    useEffect(() => {
        const onTokenRefreshed = (newToken: string) => {
            setToken(newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        };

        authEvents.on(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);

        return () => {
            authEvents.off(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);
        };
    }, [setToken]);

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

        if (user.language) {
            i18n.changeLanguage(user.language);
        }

        setAuthState(token, user);

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

        setAuthState(null, null);

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

    async function changeLanguage(lang: 'en' | 'es') {
        try {
            // Update i18n immediately for better UX
            await i18n.changeLanguage(lang);

            // Persist to backend
            const formData = new FormData();
            formData.append('language', lang);

            const res = await authApi.updateProfile(formData);
            if (res.status === 200) {
                const newUser = { ...user!, language: lang }; // Use local lang to be sure
                setUser(newUser);
                await setItem("user", JSON.stringify(newUser));
            }
        } catch (error) {
            console.error("Failed to change language:", error);
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
    }, [setUser]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile, refreshUser, changeLanguage }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
