import { useState, useEffect } from "react";
import { booksApi } from "../../constants/api";

export function useBookLists(title: string) {
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!title) return;

        const fetchLists = async () => {
            try {
                setLoading(true);
                const res = await booksApi.searchListsByBook(title);
                setLists(res.data.lists);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLists();
    }, [title]);

    return { lists, loading };
}