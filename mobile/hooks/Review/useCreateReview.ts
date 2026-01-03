import { useState, useCallback } from "react";
import { reviewBookApi } from "../../constants/api";

interface CreateReviewPayload {
    rating: number;
    review: string;
    authors?: string[];
}

export function useCreateReview(bookId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDuplicate, setIsDuplicate] = useState(false);

    const createReview = useCallback(
        async ({ rating, review, authors }: CreateReviewPayload) => {
            setLoading(true);
            setError(null);
            setIsDuplicate(false);

            try {
                const data = await reviewBookApi.createReview(
                    bookId,
                    review,
                    rating,
                    authors
                );

                return data;
            } catch (err: any) {
                if (err.type === "DUPLICATE_REVIEW") {
                    setIsDuplicate(true);
                    setError(err.message);
                    return null;
                }

                setError("Unexpected error while creating review");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [bookId]
    );

    return {
        createReview,
        loading,
        error,
        isDuplicate,
    };
}
