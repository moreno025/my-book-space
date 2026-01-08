import { useState, useCallback } from "react";
import { challengeApi } from "../../constants/api";
import { ReadingChallenge } from "../../types/challenge";
import { useToast } from "../../context/ToastContext";

export function useReadingChallenges() {
    const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const fetchChallenges = useCallback(async () => {
        try {
            setLoading(true);
            const response = await challengeApi.getChallenges();
            setChallenges(response.data.challenges);
        } catch (error) {
            console.error("Error fetching challenges:", error);
            showToast("Failed to load challenges", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const createChallenge = async (data: {
        title: string;
        goalBooks: number;
        goalPages?: number;
        startDate: string;
        endDate: string;
        genres?: string[]
    }) => {
        try {
            setLoading(true);
            await challengeApi.createChallenge(data);
            showToast("Challenge created successfully!", "success");
            await fetchChallenges();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create challenge";
            showToast(message, "error");
            // Do not re-throw handled validation errors
            if (error.response?.status !== 400) {
                // Optional: log unexpected errors
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteChallenge = async (challengeId: string) => {
        try {
            setLoading(true);
            await challengeApi.deleteChallenge(challengeId);
            showToast("Challenge deleted", "success");
            setChallenges(prev => prev.filter(c => c._id !== challengeId));
        } catch (error) {
            console.error("Error deleting challenge:", error);
            showToast("Failed to delete challenge", "error");
        } finally {
            setLoading(false);
        }
    };

    return {
        challenges,
        loading,
        fetchChallenges,
        createChallenge,
        deleteChallenge
    };
}
