import { useCallback, useEffect, useState } from "react";
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

    const fetchLists = useCallback(async () => {
        if (!username) return;

        try {
            setLoading(true);
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
