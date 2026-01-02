import { useState, useCallback, useEffect } from "react";
import { userApi } from "../../constants/api";

export interface UserHistoryItem {
    _id: string;
    searchedUser: {
        _id: string;
        username: string;
        name?: string;
        avatar?: string;
    };
    createdAt: string;
}

export function useUserSearchHistory(token: string | null) {
    const [history, setHistory] = useState<UserHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await userApi.getHistory();
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching user history", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const save = useCallback(async (searchedUserId: string) => {
        if (!token) return;
        try {
            await userApi.saveHistory(searchedUserId);
            // Refetch to get the updated list with the correct order and populated fields
            fetchHistory();
        } catch (error) {
            console.error("Error saving user history", error);
        }
    }, [token, fetchHistory]);

    const remove = useCallback(async (searchedUserId: string) => {
        if (!token) return;
        try {
            setHistory(prev => prev.filter(item => item.searchedUser._id !== searchedUserId));
            await userApi.deleteHistoryItem(searchedUserId);
        } catch (error) {
            console.error("Error deleting user history item", error);
            fetchHistory();
        }
    }, [token, fetchHistory]);

    const clear = useCallback(async () => {
        if (!token) return;
        try {
            setHistory([]);
            await userApi.clearHistory();
        } catch (error) {
            console.error("Error clearing user history", error);
            fetchHistory();
        }
    }, [token, fetchHistory]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, save, remove, clear, refetch: fetchHistory };
}
