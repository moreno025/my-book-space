import { useState, useEffect, useCallback } from "react";
import { reviewBookApi } from "../../constants/api";

export function useBookReviews(bookId: string) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        if (!bookId) return;
        try {
            setLoading(true);
            const res = await reviewBookApi.getBookReviews(bookId);
            setReviews(res.data.reviews);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, loading, refetch: fetchReviews };
}
