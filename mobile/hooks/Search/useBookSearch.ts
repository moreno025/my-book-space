import { useEffect, useState } from "react";
import { booksApi } from "../../constants/api/index";

type Book = {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
    rating?: number;
    publishedDate?: string;
};

function scoreBook(item: any, query: string) {
    const title = item.volumeInfo?.title?.toLowerCase() ?? "";
    const authors = item.volumeInfo?.authors?.join(" ").toLowerCase() ?? "";

    let score = 0;

    if (title === query) score += 100;
    if (title.startsWith(query)) score += 50;
    if (title.includes(query)) score += 30;
    if (authors.includes(query)) score += 10;

    if (item.volumeInfo?.averageRating) {
        score += item.volumeInfo.averageRating * 2;
    }

    return score;
}

export function useBookSearch(query: string) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (query.trim().length === 0) {
            setBooks([]);
            setHasSearched(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            try {
                const normalizedQuery = query.trim().replace(/\s+/g, " ");
                const q =
                    normalizedQuery.length >= 4
                        ? `intitle:${normalizedQuery}`
                        : normalizedQuery;

                const res = await booksApi.searchBooks(q, controller.signal);
                const items = res.data.items ?? [];

                const scored = items
                    .map((item: any) => ({
                        item,
                        score: scoreBook(item, normalizedQuery.toLowerCase()),
                    }))
                    .filter((s: any) => s.score > 0)
                    .sort((a: any, b: any) => b.score - a.score)
                    .map((s: any) => s.item);

                const unique = new Map<string, any>();

                scored.forEach((item: any) => {
                    const title = item.volumeInfo?.title?.toLowerCase();
                    const author = item.volumeInfo?.authors?.[0]?.toLowerCase() ?? "";
                    const key = `${title}-${author}`;

                    if (
                        title &&
                        item.volumeInfo?.imageLinks?.thumbnail &&
                        !unique.has(key)
                    ) {
                        unique.set(key, item);
                    }
                });

                const mapped: Book[] = Array.from(unique.values())
                    .slice(0, 12)
                    .map((item: any) => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || [],
                        coverUrl: item.volumeInfo.imageLinks.thumbnail,
                        rating: item.volumeInfo.averageRating,
                        publishedDate: item.volumeInfo.publishedDate,
                    }));

                setBooks(mapped);
                setHasSearched(true);
            } catch (err: any) {
                if (err.name !== "CanceledError") {
                    console.error("Search error", err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 800);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);

    return {
        books,
        loading,
        hasSearched,
    };
}
