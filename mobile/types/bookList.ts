export interface BookListBook {
    googleBookId: string;
    title: string;
    authors: string[];
    thumbnail: string;
    publishedDate: string;
}

export interface BookList {
    _id: string;
    title: string;
    description: string;
    isPublic: boolean;
    books: BookListBook[];
    savedBy: string[];
    createdAt: string;
    updatedAt: string;
}
