import { useEffect, useState } from "react";
import { booksApi } from "../../constants/api/index";

export type Book = {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
};

export function useHomeBooks() {
    const [sciFi, setSciFi] = useState<Book[]>([]);
    const [horror, setHorror] = useState<Book[]>([]);
    const [romance, setRomance] = useState<Book[]>([]);
    const [thriller, setThriller] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                const [sciFiRes, horrorRes, romanceRes, thrillerRes] = await Promise.all([
                    booksApi.searchBooks('subject:"science fiction"', 'newest'),
                    booksApi.searchBooks('subject:"horror"', 'relevance'),
                    booksApi.searchBooks('subject:"romance"', 'relevance'),
                    booksApi.searchBooks('subject:"thriller"', 'newest'),
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
    }, []);

    return { sciFi, horror, romance, thriller, loading };
}
