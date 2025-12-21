import { useMemo } from "react";
import { Book } from "../../types/book";

interface UseSimilarBooksProps {
    currentBook: Book;
    allBooks: Book[];
    maxResults?: number;
}

export function useSimilarBooks({ currentBook, allBooks, maxResults = 10 }: UseSimilarBooksProps) {
    return useMemo(() => {
        if (!currentBook || !allBooks?.length) return [];

        const scoreBook = (book: Book) => {
            let score = 1;

            const currentTitleWords = currentBook.title.split(" ").slice(0, 2).join(" ").toLowerCase();
            const bookTitleWords = book.title.split(" ").slice(0, 2).join(" ").toLowerCase();
            if (currentTitleWords === bookTitleWords && currentTitleWords.length > 3) {
                score += 15;
            }

            if (book.authors.some(a => currentBook.authors.includes(a))) {
                score += 10;
            }

            const catMatches = book.categories.filter(c => currentBook.categories.includes(c)).length;
            score += catMatches * 3;

            if (book.rating) score += book.rating / 2;

            if (book.id === currentBook.id || book.title.toLowerCase() === currentBook.title.toLowerCase()) {
                score = -1;
            }

            return score;
        };

        const sorted = allBooks
            .map(book => ({ ...book, similarityScore: scoreBook(book) }))
            .filter(b => b.similarityScore > 0)
            .sort((a, b) => b.similarityScore - a.similarityScore);

        return sorted.slice(0, maxResults);
    }, [currentBook, allBooks, maxResults]);
}
