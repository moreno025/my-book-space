import { useState, useCallback } from "react";
import { reviewBookApi } from "../../constants/api";

interface UpdateReviewPayload {
    rating: number;
    review: string;
}

export function useUpdateReview(reviewId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateReview = useCallback(
        async ({ rating, review }: UpdateReviewPayload) => {
            setLoading(true);
            setError(null);

            try {
                const data = await reviewBookApi.updateReview(
                    reviewId,
                    review,
                    rating
                );

                return data;
            } catch (err: any) {
                setError(err.response?.data?.message || "Unexpected error while updating review");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [reviewId]
    );

    return {
        updateReview,
        loading,
        error,
    };
}
