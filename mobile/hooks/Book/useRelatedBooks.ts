import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Book } from "../../types/book";
import { booksApi } from "../../constants/api/index";

export function useRelatedBooks(currentBook: Book | null) {
    const { i18n } = useTranslation();
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!currentBook) {
            setRelatedBooks([]);
            return;
        }

        const fetchRelated = async () => {
            try {
                setLoading(true);

                const queries: string[] = [];

                // 1. Same Author
                if (currentBook.authors.length > 0) {
                    queries.push(`inauthor:${currentBook.authors[0]}`);
                }

                // 2. Possible Collection (First two words of title)
                const titleWords = currentBook.title.split(" ");
                if (titleWords.length >= 2) {
                    queries.push(`intitle:${titleWords.slice(0, 2).join(" ")}`);
                }

                // 3. Categories
                if (currentBook.categories.length > 0) {
                    queries.push(`subject:${currentBook.categories[0]}`);
                }

                // Fetching from multiple queries in parallel with error handling
                const fetchResults = await Promise.allSettled(
                    queries.map(q => booksApi.searchBooks(q, undefined, i18n.language))
                );

                let allItems: any[] = [];
                fetchResults.forEach(result => {
                    if (result.status === "fulfilled" && result.value.data.items) {
                        allItems = [...allItems, ...result.value.data.items];
                    } else if (result.status === "rejected") {
                        console.warn("One of the related books queries failed:", result.reason);
                    }
                });

                // Fallback: If we have very few results, fetch something popular/general
                if (allItems.length < 5) {
                    try {
                        const fallbackRes = await booksApi.searchBooks("fiction popular", undefined, i18n.language);
                        if (fallbackRes.data.items) {
                            allItems = [...allItems, ...fallbackRes.data.items];
                        }
                    } catch (fallbackErr) {
                        console.error("Fallback search failed:", fallbackErr);
                    }
                }

                // Map and deduplicate by ID
                const uniqueIds = new Set<string>();
                const mapped: Book[] = [];

                allItems.forEach((item: any) => {
                    const cover = item.volumeInfo.imageLinks?.thumbnail;
                    const title = item.volumeInfo.title;
                    if (!title || !cover) return; // filtramos libros incompletos

                    if (!uniqueIds.has(item.id)) {
                        uniqueIds.add(item.id);
                        mapped.push({
                            id: item.id,
                            title,
                            authors: item.volumeInfo.authors ?? [],
                            description: item.volumeInfo.description ?? "",
                            coverUrl: cover,
                            rating: item.volumeInfo.averageRating ?? null,
                            ratingsCount: item.volumeInfo.ratingsCount ?? null,
                            pages: item.volumeInfo.pageCount ?? null,
                            publishedYear: item.volumeInfo.publishedDate
                                ? Number(item.volumeInfo.publishedDate.slice(0, 4))
                                : null,
                            categories: item.volumeInfo.categories ?? [],
                            language: item.volumeInfo.language ?? "en",
                        });
                    }
                });

                setRelatedBooks(mapped);
            } catch (err) {
                console.error("Error fetching related books:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [currentBook?.id, currentBook, i18n.language]);

    return { relatedBooks, loading };
}
