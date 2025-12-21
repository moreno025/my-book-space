export interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string;
    coverUrl: string | null;
    rating: number | null;
    ratingsCount: number | null;
    pages: number | null;
    publishedYear: number | null;
    categories: string[];
    language: string;
}
