export interface ReadingChallenge {
    _id: string;
    user: string;
    title: string;
    goalBooks: number;
    goalPages: number;
    startDate: string;
    endDate: string;
    presetType: 'year' | 'six_months' | 'custom';
    status: 'active' | 'completed' | 'expired';
    genres: string[];
    booksRead: string[]; // Google Book IDs
    pagesRead: number;
    createdAt: string;
    updatedAt: string;
}
