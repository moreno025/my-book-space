import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Book } from "../../types/book";
import { booksApi } from "../../constants/api/index";



function cleanDescription(html: string | undefined): string {
    if (typeof html !== "string") return "";
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim();
}

function cleanCategories(categories: string[] | undefined, limit = 3): string[] {
    if (!Array.isArray(categories)) return [];

    const flattened = categories
        .filter(c => typeof c === "string")
        .map(c => c.split("/").map(sub => sub.trim()))
        .flat();

    const unique = Array.from(new Set(flattened));

    return unique.slice(0, limit);
}

export function useBookDetail(id: string) {
    const { i18n } = useTranslation();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchBook = async () => {
            try {
                setLoading(true);
                const res = await booksApi.getBookById(id, i18n.language);

                const data: Book = {
                    ...res.data,
                    description: cleanDescription(res.data.description),
                    categories: cleanCategories(res.data.categories, 3),
                };

                setBook(data);
            } catch (err: any) {
                setError("Error loading book");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, i18n.language]);

    return { book, loading, error };
}
