import { publicApi } from "./publicApi";
import { privateApi } from "./privateApi";

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
};

export const booksApi = {
    searchBooks: (query: string, signal?: AbortSignal) =>
        publicApi.get("/book/search", { params: { q: query }, signal }),

    saveHistory: (query: string) =>
        privateApi.post("/book/search/history", { query }),

    getHistory: () =>
        privateApi.get("/book/search/history"),

    clearHistory: () =>
        privateApi.delete("/book/search/history"),

    deleteHistoryItem: (query: string) =>
        privateApi.delete(`/book/search/history/${query}`),

    getBookById: (id: string) =>
        publicApi.get(`/book/${id}`),
};

export const reviewBookApi = {
    async createReview(bookId: string, review: string, rating: number) {
        try {
            const response = await privateApi.post(`/review/${bookId}`, { review, rating });
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
