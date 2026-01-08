import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

function simplifyTitle(title: string) {
    // Remove subtitles (after :), parentheticals ( ( [ ), and dashes ( - )
    const base = title.split(":")[0].split("(")[0].split("[")[0].split(" - ")[0];
    return stripAccents(base.trim().toLowerCase());
}

function normalizeAuthor(author: string) {
    // Strip accents, dots, spaces, and punctuation to merge variants like "J.K. Rowling" and "J. K. Rowling"
    const cleaned = stripAccents(author.toLowerCase());
    return cleaned.replace(/[^a-z0-9]/g, "");
}

function normalizeKey(title: string, author: string) {
    return `${simplifyTitle(title)}|${normalizeAuthor(author)}`;
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
    const tokens = qNorm.split(/\s+/).filter((t: string) => t.length > 2);
    if (tokens.length > 1) {
        let titleTokensMatched = 0;
        let authorTokensMatched = 0;

        tokens.forEach((token: string) => {
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

    // 5. Aesthetic & Quality Heuristics
    const ratingsCount = item.volumeInfo?.ratingsCount || 0;
    const publishedDate = item.volumeInfo?.publishedDate || "";
    const year = parseInt(publishedDate.substring(0, 4));
    const description = item.volumeInfo?.description || "";

    // Penalty for no ratings (obscure/niche books)
    if (ratingsCount === 0) {
        score -= 50;
    }

    // Classic vs Obscure/Typographic Covers
    // Many "weird" typography-only covers are for old public domain scans.
    // We penalize old books unless they are verified classics (high rating count).
    if (!isNaN(year) && year < 1950 && ratingsCount < 10) {
        score -= 100;
    }

    // Metadata richness boost (Real books tend to have longer descriptions)
    if (description.length > 500) {
        score += 30;
    } else if (description.length > 100) {
        score += 15;
    }

    return score;
}

export function useBookSearch(query: string) {
    const { i18n } = useTranslation();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setPage(1);
        setBooks([]);
        setHasMore(true);
    }, [query]);

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
                const q = normalizedQuery;

                const res = await booksApi.searchBooks(q, undefined, i18n.language, page, controller.signal);
                const items = res.data.items ?? [];

                if (items.length < 10 && page > 1) { // Google Books is inconsistent with totalItems, so we check if returned few
                    setHasMore(false);
                }

                const scored = items
                    .map((item: any) => ({
                        item,
                        score: scoreBook(item, normalizedQuery.toLowerCase()),
                    }))
                    .sort((a: any, b: any) => b.score - a.score)
                    .map((s: any) => s.item);

                const unique = new Map<string, any>();

                scored.forEach((item: any) => {
                    const fullTitle = item.volumeInfo?.title || "";
                    const primaryAuthor = item.volumeInfo?.authors?.[0] || "";
                    const key = normalizeKey(fullTitle, primaryAuthor);

                    if (
                        fullTitle &&
                        item.volumeInfo?.imageLinks?.thumbnail &&
                        !unique.has(key)
                    ) {
                        unique.set(key, item);
                    }
                });

                const mapped: Book[] = Array.from(unique.values())
                    .map((item: any) => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || [],
                        coverUrl: item.volumeInfo.imageLinks?.thumbnail || "",
                        rating: item.volumeInfo.averageRating,
                        publishedDate: item.volumeInfo.publishedDate,
                        categories: item.volumeInfo.categories || [],
                    }));

                if (page === 1) {
                    setBooks(mapped);
                } else {
                    setBooks(prev => [...prev, ...mapped]);
                }

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
        }, page === 1 ? 800 : 0);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query, i18n.language, page]);

    return {
        books,
        loading,
        hasSearched,
        page,
        setPage,
        hasMore
    };
}
