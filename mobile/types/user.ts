/** User interface for the application */
export interface User {
    _id: string; // MongoDB ID
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role?: "user" | "admin";
    lastName?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    listsCount?: number;
    isPrivate?: boolean;
    isFollowing?: boolean;
    isRequested?: boolean;
    canViewFullProfile?: boolean;
    readingProfile?: ReadingProfile;
    language?: 'en' | 'es';
}

export interface ReadingProfile {
    favoriteGenres: string[];
    favoriteAuthors: string[];
    bookLengthPreference: 'short' | 'medium' | 'long' | 'mixed';
    mostLikedBooks: {
        googleBookId: string;
        title: string;
        author: string;
        cover: string;
    }[];
}
