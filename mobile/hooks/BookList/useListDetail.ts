import { useState, useEffect, useCallback } from "react";
import { BookList } from "../../types/bookList";
import { bookListApi } from "../../constants/api";

export function useListDetail(listId: string) {
    const [list, setList] = useState<BookList | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        if (!listId) return;
        try {
            if (!list) setLoading(true);
            else setRefreshing(true);

            const res = await bookListApi.getListById(listId);
            setList(res.data.list);
            setError(null);
        } catch (err) {
            console.error("Error fetching list:", err);
            setError("Failed to load list details");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [listId, list]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    return { list, loading, refreshing, error, refetch: fetchList };
}
