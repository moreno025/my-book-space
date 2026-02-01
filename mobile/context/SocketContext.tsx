import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.137:4000";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let socketInstance: Socket | null = null;

        const initSocket = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                // Only connect if we have a token
                if (!token) {
                    console.log("No token found, skipping socket connection");
                    return;
                }

                socketInstance = io(API_URL, {
                    auth: { token },
                    transports: ["websocket"],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    autoConnect: true,
                });

                socketInstance.on("connect", () => {
                    console.log("Socket connected");
                    setIsConnected(true);
                });

                socketInstance.on("disconnect", () => {
                    console.log("Socket disconnected");
                    setIsConnected(false);
                });

                socketInstance.on("connect_error", (error) => {
                    console.error("Socket connection error:", error.message);
                    setIsConnected(false);
                });

                setSocket(socketInstance);
            } catch (error) {
                console.error("Error initializing socket:", error);
            }
        };

        initSocket();

        // Cleanup function
        return () => {
            if (socketInstance) {
                console.log("Cleaning up socket connection");
                socketInstance.disconnect();
                socketInstance.removeAllListeners();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
