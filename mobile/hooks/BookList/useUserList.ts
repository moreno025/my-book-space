import { useCallback, useEffect, useState, useRef } from "react";
import { BookList } from "../../types/bookList";
import { bookListApi } from "../../constants/api/index";

interface UseUserListsOptions {
    username: string;
    enabled?: boolean;
}

export function useUserLists({ username, enabled = true }: UseUserListsOptions) {
    const [lists, setLists] = useState<BookList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listsRef = useRef<BookList[]>([]);
    useEffect(() => {
        listsRef.current = lists;
    }, [lists]);

    const fetchLists = useCallback(async () => {
        if (!username) return;

        try {
            // Check if we already have data to decide on showing the loading state
            // We use a functional approach or check the existing state directly 
            // but to be absolutely safe with dependencies, we'll keep it simple.
            setLoading(prev => {
                // Only set loading to true if lists are currently empty
                if (listsRef.current.length === 0) return true;
                return prev;
            });
            setError(null);

            const res = await bookListApi.getUserLists(username);
            setLists(res.data.lists);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError("This profile is private");
            } else if (err.response?.status === 404) {
                setError("User not found");
            } else {
                setError("Error loading lists");
            }
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        if (enabled) {
            fetchLists();
        }
    }, [fetchLists, enabled]);

    return {
        lists,
        loading,
        error,
        refetch: fetchLists,
        isEmpty: !loading && lists.length === 0,
    };
}
