import { useState, useEffect } from "react";
import { userApi } from "../../constants/api";
import { User } from "../../types/user";

export function useUserSearch(query: string) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const searchUsers = async () => {
            if (!query || query.trim().length === 0) {
                setUsers([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);

            try {
                const response = await userApi.searchUsers(query);
                const usersWithId = response.data.users.map((u: any) => ({
                    ...u,
                    id: u._id,
                }));
                setUsers(usersWithId || []);
            } catch (error) {
                console.error("Error searching users:", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    return { users, loading, hasSearched };
}
