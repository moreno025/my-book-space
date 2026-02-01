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
            // Check current status WITHOUT depending on the 'list' state variable directly in dependencies
            // We can use the fact that setLoading(true) only happens if it was true initially
            // or we can use a functional check if we really need it.
            // But since we want to avoid the loop, we'll just use the listId as dependency.

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
    }, [listId]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const addCollaborator = async (userId: string) => {
        try {
            await bookListApi.addCollaborator(listId, userId);
            await fetchList();
            return true;
        } catch (err: any) {
            console.error("Error adding collaborator:", err);
            throw err;
        }
    };

    const removeCollaborator = async (userId: string) => {
        try {
            await bookListApi.removeCollaborator(listId, userId);
            await fetchList();
            return true;
        } catch (err: any) {
            console.error("Error removing collaborator:", err);
            throw err;
        }
    };

    return { list, loading, refreshing, error, refetch: fetchList, addCollaborator, removeCollaborator };
}
