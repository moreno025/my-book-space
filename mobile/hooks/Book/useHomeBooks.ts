import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { booksApi } from "../../constants/api/index";

export type Book = {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
};

export function useHomeBooks() {
    const { i18n } = useTranslation();
    const [trending, setTrending] = useState<Book[]>([]);
    const [sciFi, setSciFi] = useState<Book[]>([]);
    const [horror, setHorror] = useState<Book[]>([]);
    const [romance, setRomance] = useState<Book[]>([]);
    const [thriller, setThriller] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                const isSpanish = i18n.language?.startsWith('es');
                const queries = {
                    sciFi: isSpanish ? 'subject:"ciencia ficción"' : 'subject:"science fiction"',
                    horror: isSpanish ? 'subject:"terror"' : 'subject:"horror"',
                    romance: isSpanish ? 'subject:"romance"' : 'subject:"romance"',
                    thriller: isSpanish ? 'subject:"suspense"' : 'subject:"thriller"',
                };

                const [trendingRes, sciFiRes, horrorRes, romanceRes, thrillerRes] = await Promise.all([
                    // Trending: Fetch authentic bestsellers from our new backend service
                    booksApi.getTrendingBooks(i18n.language),
                    booksApi.searchBooks(queries.sciFi, 'newest', i18n.language),
                    booksApi.searchBooks(queries.horror, 'relevance', i18n.language),
                    booksApi.searchBooks(queries.romance, 'relevance', i18n.language),
                    booksApi.searchBooks(queries.thriller, 'newest', i18n.language),
                ]);

                const seenIds = new Set<string>();

                const mapAndDedupe = (items: any[]) => {
                    const result: Book[] = [];
                    (items ?? []).forEach((item: any) => {
                        if (!seenIds.has(item.id)) {
                            seenIds.add(item.id);
                            result.push({
                                id: item.id,
                                title: item.volumeInfo.title,
                                authors: item.volumeInfo.authors || ["Unknown"],
                                coverUrl: item.volumeInfo.imageLinks?.thumbnail,
                            });
                        }
                    });
                    return result;
                };

                setTrending(mapAndDedupe(trendingRes.data.items).slice(0, 5));
                setSciFi(mapAndDedupe(sciFiRes.data.items));
                setHorror(mapAndDedupe(horrorRes.data.items));
                setRomance(mapAndDedupe(romanceRes.data.items));
                setThriller(mapAndDedupe(thrillerRes.data.items));

            } catch (error) {
                console.error("Error fetching home books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [i18n.language]);

    return { trending, sciFi, horror, romance, thriller, loading };
}
