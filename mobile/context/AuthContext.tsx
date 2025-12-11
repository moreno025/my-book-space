import { createContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/storage";
import { loginRequest, registerRequest } from "../constants/auth-api";

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
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => false,
    register: async () => false,
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar credenciales guardadas
    useEffect(() => {
        async function loadSession() {
            const savedToken = await getItem("token");
            const savedUser = await getItem("user");

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }

            setLoading(false);
        }

        loadSession();
    }, []);

    async function login(email: string, password: string) {
        const res = await loginRequest(email, password);

        if (!res.ok) return false;

        setToken(res.data.token);
        setUser(res.data.user);

        await setItem("token", res.data.token);
        await setItem("user", JSON.stringify(res.data.user));

        return true;
    }

    async function register(values: any) {
        const res = await registerRequest(values);
        return res.ok;
    }

    function logout() {
        setUser(null);
        setToken(null);
        removeItem("token");
        removeItem("user");
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}