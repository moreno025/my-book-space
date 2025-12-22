export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role?: "user" | "admin";
    followersCount?: number;
    followingCount?: number;
    listsCount?: number;
}
