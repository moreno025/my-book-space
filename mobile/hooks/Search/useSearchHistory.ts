import { useEffect, useState } from "react";
import { booksApi } from "../../constants/api/index";

export function useSearchHistory(token: string | null) {
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setHistory([]);
            return;
        }

        loadHistory();
    }, [token]);

    async function loadHistory() {
        if (!token) return;
        try {
            setLoading(true);
            const res = await booksApi.getHistory();
            setHistory(res.data.map((h: any) => h.query));
        } catch (err) {
            console.error("Error loading history", err);
        } finally {
            setLoading(false);
        }
    }

    async function save(query: string) {
        if (!token || query.length < 3) return;
        try {
            await booksApi.saveHistory(query);
            await loadHistory();
        } catch (err) {
            console.error("Error saving history", err);
        }
    }

    async function remove(query: string) {
        if (!token) return;
        try {
            await booksApi.deleteHistoryItem(query);
            setHistory((prev) => prev.filter((h) => h !== query));
        } catch (err) {
            console.error("Error deleting history item", err);
        }
    }

    async function clear() {
        if (!token) return;
        try {
            await booksApi.clearHistory();
            setHistory([]);
        } catch (err) {
            console.error("Error clearing history", err);
        }
    }

    return {
        history,
        loading,
        save,
        remove,
        clear,
    };
}
