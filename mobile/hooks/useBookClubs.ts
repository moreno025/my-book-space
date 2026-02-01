import { useState, useEffect } from "react";
import { bookClubApi } from "@/constants/api/bookClub";
import { BookClub } from "@/types/bookClub";

export const useBookClubs = () => {
    const [myClubs, setMyClubs] = useState<BookClub[]>([]);
    const [discoverClubs, setDiscoverClubs] = useState<BookClub[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyClubs = async () => {
        try {
            setLoading(true);
            const { clubs } = await bookClubApi.getUserClubs();
            setMyClubs(clubs);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch clubs");
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscoverClubs = async () => {
        try {
            setLoading(true);
            const { clubs } = await bookClubApi.discoverClubs();
            setDiscoverClubs(clubs);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch clubs");
        } finally {
            setLoading(false);
        }
    };

    const createClub = async (data: { name: string; description?: string; visibility?: 'public' | 'private' }) => {
        try {
            setLoading(true);
            const result = await bookClubApi.createClub(data);
            await fetchMyClubs();
            return result;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Failed to create club");
        } finally {
            setLoading(false);
        }
    };

    const joinClub = async (clubId: string) => {
        try {
            setLoading(true);
            const result = await bookClubApi.joinClub(clubId);
            await fetchMyClubs();
            await fetchDiscoverClubs();
            return result;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Failed to join club");
        } finally {
            setLoading(false);
        }
    };

    const leaveClub = async (clubId: string) => {
        try {
            setLoading(true);
            await bookClubApi.leaveClub(clubId);
            await fetchMyClubs();
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Failed to leave club");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClubs();
        fetchDiscoverClubs();
    }, []);

    return {
        myClubs,
        discoverClubs,
        loading,
        error,
        fetchMyClubs,
        fetchDiscoverClubs,
        createClub,
        joinClub,
        leaveClub,
    };
};
