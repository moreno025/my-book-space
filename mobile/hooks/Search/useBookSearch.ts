import { useEffect, useState } from "react";
import { booksApi } from "../../constants/api/index";

type Book = {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
    rating?: number;
    publishedDate?: string;
    categories?: string[];
};

function stripAccents(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scoreBook(item: any, query: string) {
    const titleRaw = item.volumeInfo?.title?.toLowerCase() ?? "";
    const authorsRaw = item.volumeInfo?.authors?.join(" ").toLowerCase() ?? "";
    const qLower = query.toLowerCase();

    // Normalización sin acentos
    const title = stripAccents(titleRaw);
    const authors = stripAccents(authorsRaw);
    const qNorm = stripAccents(qLower);

    let score = 0;

    // 1. Title direct matches
    if (title === qNorm) score += 200; // Exact match is king
    if (title.startsWith(qNorm)) score += 100;
    if (title.includes(qNorm)) score += 50;

    // 2. Author direct matches
    if (authors.includes(qNorm)) score += 80;

    // 3. Tokenized matching (Intelligent partials)
    const tokens = qNorm.split(/\s+/).filter(t => t.length > 2);
    if (tokens.length > 1) {
        let titleTokensMatched = 0;
        let authorTokensMatched = 0;

        tokens.forEach(token => {
            if (title.includes(token)) titleTokensMatched++;
            if (authors.includes(token)) authorTokensMatched++;
        });

        // Boost if all tokens match across title/author
        if (titleTokensMatched + authorTokensMatched >= tokens.length) {
            score += 150;
        }
    }

    // 4. Popularity Boosting
    if (item.volumeInfo?.ratingsCount) {
        const count = item.volumeInfo.ratingsCount;
        // Logarithmic base boost
        score += Math.log10(count) * 20;

        // Mega-Priority Tiers
        if (count > 5000) {
            score += 200; // Bestseller
        } else if (count > 1000) {
            score += 100; // Popular
        } else if (count > 100) {
            score += 50;
        }
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
                // Remove restrictive intitle: prefix to allow author searches
                const q = normalizedQuery;

                // Pass undefined for orderBy to use default relevance
                const res = await booksApi.searchBooks(q, undefined, controller.signal);
                const items = res.data.items ?? [];

                const scored = items
                    .map((item: any) => ({
                        item,
                        score: scoreBook(item, normalizedQuery.toLowerCase()),
                    }))
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
                        coverUrl: item.volumeInfo.imageLinks?.thumbnail || "",
                        rating: item.volumeInfo.averageRating,
                        publishedDate: item.volumeInfo.publishedDate,
                        categories: item.volumeInfo.categories || [],
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
