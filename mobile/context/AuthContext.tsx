import { createContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";
import { authApi } from "../constants/api";


interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

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

            console.log("TOKEN RECUPERADO EN CONTEXT:", savedToken);

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }

            setLoading(false);
        }

        loadSession();
    }, []);

    async function login(email: string, password: string) {
        const res = await authApi.login(email, password);

        console.log("LOGIN RESPONSE:", res.data);

        const { token, user } = res.data;

        if (!token) {
            console.error("TOKEN NO VIENE EN LA RESPUESTA");
            return false;
        }

        await setItem("token", token);
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
        setUser(null);
        setToken(null);
        await removeItem("token");
        await removeItem("user");
    }

    console.log("user auth en el front:", user);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}