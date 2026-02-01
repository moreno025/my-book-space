import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { booksApi, bookListApi } from "../../constants/api/index";
import { useAuth } from "../useAuth";

export type Book = {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
    description?: string;
    reason?: string; // For hero explanation
};

export type CuratedContent = {
    hero: Book | null;
    personal: { title: string, books: Book[] } | null;
    editorial: { theme: string, books: Book[] } | null;
    social: { user: string, text: string, book: Book } | null;
};

export function useHomeBooks() {
    const { i18n, t } = useTranslation();
    const { user } = useAuth();
    const [curatedData, setCuratedData] = useState<CuratedContent>({
        hero: null,
        personal: null,
        editorial: null,
        social: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurated = async () => {
            setLoading(true);
            const isSpanish = i18n.language?.startsWith('es');

            let hero: Book | null = null;
            let personal: { title: string, books: Book[] } | null = null;
            let editorial: { theme: string, books: Book[] } | null = null;
            let social: { user: string, text: string, book: Book } | null = null;

            // 1. Fetch Trending for Hero
            try {
                const trendingRes = await booksApi.getTrendingBooks(i18n.language);
                const trendingItems = trendingRes.data.items || [];
                if (trendingItems.length > 0) {
                    const item = trendingItems[0];
                    hero = {
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || ["Unknown"],
                        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
                        description: item.volumeInfo.description,
                        reason: t('home.hero_reason_trending')
                    };
                }
            } catch (err) {
                console.warn("⚠️ [Home] Trending fetch failed:", err);
            }

            // 2. Personal Block (based on user lists)
            if (user?.username) {
                try {
                    const listsRes = await bookListApi.getUserLists(user.username);
                    const lists = listsRes.data.lists || [];
                    if (lists.length > 0) {
                        const favoritelist = lists[0];
                        // Search related to the first list's title or categories
                        const searchQuery = favoritelist.title;
                        const searchRes = await booksApi.searchBooks(searchQuery, 'relevance', i18n.language);
                        personal = {
                            title: t('home.based_on_list', { list: favoritelist.title }),
                            books: (searchRes.data.items || []).slice(0, 6).map((item: any) => ({
                                id: item.id,
                                title: item.volumeInfo.title,
                                authors: item.volumeInfo.authors || ["Unknown"],
                                coverUrl: item.volumeInfo.imageLinks?.thumbnail,
                            }))
                        };
                    }
                } catch (err) {
                    console.warn("⚠️ [Home] Personal fetch failed:", err);
                }
            }

            // 3. Editorial Block
            try {
                const editorialQuery = isSpanish ? 'subject:"literatura"' : 'subject:"literature"';
                const editorialRes = await booksApi.searchBooks(editorialQuery, 'newest', i18n.language);
                const editorialItems = (editorialRes.data.items || []).slice(0, 3);
                editorial = {
                    theme: t('home.editorial_theme'),
                    books: editorialItems.map((item: any) => ({
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || ["Unknown"],
                        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
                    }))
                };
            } catch (err) {
                console.warn("⚠️ [Home] Editorial fetch failed:", err);
            }

            // 4. Social Snippet
            // Depends on previous data, safe to just check local vars
            if (hero || (editorial?.books && editorial.books.length > 0)) {
                social = {
                    user: "Elena",
                    text: isSpanish
                        ? "Me atrapó desde la primera página. Hacía tiempo que no leía una prosa tan cuidada."
                        : "Caught me from the first page. It's been a while since I read such a careful prose.",
                    book: hero || (editorial!.books[0])
                };
            }

            setCuratedData({
                hero,
                personal,
                editorial,
                social
            });
            setLoading(false);
        };

        fetchCurated();
    }, [i18n.language, user?.username, t]);

    return { ...curatedData, loading };
}
