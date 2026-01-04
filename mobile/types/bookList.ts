export interface BookListBook {
    googleBookId: string;
    title: string;
    authors: string[];
    thumbnail: string;
    publishedDate: string;
    myReviewCount?: number;
    readingStatus?: "not read" | "reading" | "read";
}

export interface BookList {
    _id: string;
    title: string;
    description: string;
    visibility: 'public' | 'private';
    isPublic?: boolean;
    user: {
        _id: string;
        username: string;
        avatar?: string;
    };
    books: BookListBook[];
    savedBy: string[];
    createdAt: string;
    updatedAt: string;
}
