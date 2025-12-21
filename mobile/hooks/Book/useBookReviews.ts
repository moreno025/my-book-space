import { useState, useEffect } from "react";
import { reviewBookApi } from "../../constants/api";

export function useBookReviews(bookId: string) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookId) return;

        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await reviewBookApi.getBookReviews(bookId);
                setReviews(res.data.reviews);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [bookId]);

    return { reviews, loading };
}
