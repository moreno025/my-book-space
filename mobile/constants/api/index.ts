import { publicApi } from "./publicApi";
import { privateApi } from "./privateApi";
import { BookList } from "../../types/bookList";
import { ReadingChallenge } from "../../types/challenge";
import { Notification } from "../../types/notification";

export { publicApi, privateApi };
export { privateApi as api };

export const authApi = {
    login: (email: string, password: string) =>
        publicApi.post("/auth/login", { email, password }),

    register: (values: any) =>
        publicApi.post("/auth/register", values),

    logout: (refreshToken: string) =>
        publicApi.post("/auth/logout", { refreshToken }),

    forgotPassword: (email: string) =>
        publicApi.post("/auth/forgot-password", { email }),

    updatePassword: ({ token, newPassword }: any) =>
        publicApi.post("/auth/update-password", { token, newPassword }),

    updateProfile: (data: FormData) =>
        privateApi.put("/auth/update-profile", data),
};

export const booksApi = {
    searchBooks: (query: string, orderBy?: 'relevance' | 'newest', lang?: string, page?: number, signal?: AbortSignal) =>
        publicApi.get("/book/search", { params: { q: query, orderBy, lang, page }, signal }),

    saveHistory: (query: string) =>
        privateApi.post("/book/search/history", { query }),

    getHistory: () =>
        privateApi.get("/book/search/history"),

    clearHistory: () =>
        privateApi.delete("/book/search/history"),

    deleteHistoryItem: (query: string) =>
        privateApi.delete(`/book/search/history/${query}`),

    getBookById: (id: string, lang?: string) =>
        publicApi.get(`/book/${id}?lang=${lang || 'en'}`),

    getRecommendations: (data: { genres?: string[]; mood?: string; length?: string }, lang?: string) =>
        privateApi.post<{ recommendations: any[] }>(`/book/recommend?lang=${lang || 'en'}`, data),

    getBookByIsbn: (isbn: string, lang?: string) =>
        publicApi.get(`/book/isbn/${isbn}`, { params: { lang } }),

    getTrendingBooks: (lang?: string) =>
        publicApi.get("/book/trending", { params: { lang } }),
};

export const reviewBookApi = {
    async createReview(bookId: string, review: string, rating: number, authors?: string[]) {
        try {
            const response = await privateApi.post(`/review/${bookId}`, { review, rating, authors });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                return Promise.reject({
                    type: "DUPLICATE_REVIEW",
                    message: error.response.data.message,
                });
            }
            throw error;
        }
    },

    getBookReviews: (bookId: string) =>
        publicApi.get(`/review/book/${bookId}`),

    updateReview: (reviewId: string, review: string, rating: number) =>
        privateApi.put(`/review/${reviewId}`, { review, rating }),
};

export const bookListApi = {
    getUserLists: (username: string) =>
        privateApi.get<{ lists: BookList[] }>(`/book-list/${username}/lists`),

    createBookList: (data: { title: string; description?: string; visibility?: 'public' | 'private' }) =>
        privateApi.post<{ list: BookList }>("/book-list", data),

    addBookToList: (listId: string, bookData: { googleBookId: string; title: string; authors: string[]; thumbnail: string; publishedDate?: string; categories?: string[] }) =>
        privateApi.post(`/book-list/${listId}/add-book`, bookData),

    removeBookFromList: (listId: string, googleBookId: string) =>
        privateApi.delete(`/book-list/${listId}/remove-book/${googleBookId}`),

    deleteBookList: (listId: string) =>
        privateApi.delete(`/book-list/${listId}`),

    updateBookList: (listId: string, data: { title?: string; description?: string; visibility?: 'public' | 'private' }) =>
        privateApi.put(`/book-list/${listId}`, data),

    getListsByBookId: (googleBookId: string) =>
        privateApi.get<{ lists: BookList[] }>(`/book-list/discovery/${googleBookId}`),

    getListById: (listId: string) =>
        privateApi.get<{ list: BookList }>(`/book-list/${listId}`),

    saveList: (listId: string) =>
        privateApi.post(`/book-list/${listId}/save`),

    unsaveList: (listId: string) =>
        privateApi.post(`/book-list/${listId}/unsave`),

    copyList: (listId: string) =>
        privateApi.post(`/book-list/${listId}/copy`),

    updateBookStatus: (listId: string, googleBookId: string, status: "not read" | "reading" | "read") =>
        privateApi.patch(`/book-list/${listId}/book/${googleBookId}/status`, { status }),

    addCollaborator: (listId: string, userId: string) =>
        privateApi.post(`/book-list/${listId}/collaborators`, { userId }),

    removeCollaborator: (listId: string, userId: string) =>
        privateApi.delete(`/book-list/${listId}/collaborators/${userId}`),
};

export const userApi = {
    searchUsers: (query: string) =>
        privateApi.get("/user/search", { params: { q: query } }),

    getUserByUsername: (username: string) =>
        privateApi.get(`/user/${username}`),

    followUser: (userId: string) =>
        privateApi.put(`/user/follow-user/${userId}`),

    unfollowUser: (userId: string) =>
        privateApi.put(`/user/unfollow-user/${userId}`),

    getUserLists: (username: string) =>
        privateApi.get(`/user/${username}/lists`),

    saveHistory: (searchedUserId: string) =>
        privateApi.post("/user/history", { searchedUserId }),

    getHistory: () =>
        privateApi.get("/user/history"),

    deleteHistoryItem: (searchedUserId: string) =>
        privateApi.delete(`/user/history/${searchedUserId}`),

    clearHistory: () =>
        privateApi.delete("/user/history"),

    getFollowRequests: () =>
        privateApi.get("/user/requests/pending"),

    acceptFollowRequest: (requestId: string) =>
        privateApi.put(`/user/requests/accept/${requestId}`),

    rejectFollowRequest: (requestId: string) =>
        privateApi.put(`/user/requests/reject/${requestId}`),

    getUserStats: (userId: string) =>
        privateApi.get(`/user/stats/${userId}`),

    getFriends: () =>
        privateApi.get<{ friends: any[] }>("/user/friends"),
};

export const challengeApi = {
    getChallenges: () =>
        privateApi.get<{ challenges: ReadingChallenge[] }>("/reading-challenge"),

    createChallenge: (data: { title: string; goalBooks: number; goalPages?: number; startDate: string; endDate: string; genres?: string[]; presetType?: 'year' | 'six_months' | 'custom' }) =>
        privateApi.post<{ challenge: ReadingChallenge }>("/reading-challenge", data),

    deleteChallenge: (challengeId: string) =>
        privateApi.delete(`/reading-challenge/${challengeId}`),
};

export const notificationApi = {
    getAll: () =>
        privateApi.get<{ notifications: Notification[] }>("/notifications"),

    markAsRead: (id: string) =>
        privateApi.put<{ notification: Notification }>(`/notifications/${id}/read`),

    markAllAsRead: () =>
        privateApi.put("/notifications/read-all"),
};
