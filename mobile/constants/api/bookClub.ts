import { privateApi } from "./privateApi";
import { BookClub } from "@/types/bookClub";
import { ClubMessage } from "@/types/clubMessage";

export const bookClubApi = {
    // Club management
    createClub: async (data: { name: string; description?: string; visibility?: 'public' | 'private' }) => {
        const response = await privateApi.post("/book-club", data);
        return response.data;
    },

    getUserClubs: async (): Promise<{ clubs: BookClub[] }> => {
        const response = await privateApi.get("/book-club");
        return response.data;
    },

    discoverClubs: async (): Promise<{ clubs: BookClub[] }> => {
        const response = await privateApi.get("/book-club/discover");
        return response.data;
    },

    getClubById: async (clubId: string): Promise<{ club: BookClub; isMember: boolean; isAdmin: boolean }> => {
        const response = await privateApi.get(`/book-club/${clubId}`);
        return response.data;
    },

    updateClub: async (clubId: string, data: { name?: string; description?: string; visibility?: 'public' | 'private'; avatar?: string }) => {
        let payload: any = data;
        let headers = {};

        // Check if avatar is a local file URI (suggesting a new upload)
        // If it starts with 'http' or is empty/undefined, we treat it as JSON update (or no change)
        if (data.avatar && !data.avatar.startsWith('http') && !data.avatar.startsWith('/')) {
            const formData = new FormData();
            if (data.name) formData.append('name', data.name);
            if (data.description) formData.append('description', data.description);
            if (data.visibility) formData.append('visibility', data.visibility);

            const filename = data.avatar.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore - React Native FormData expects this format
            formData.append('avatar', { uri: data.avatar, name: filename, type } as any);

            payload = formData;
            headers = { 'Content-Type': 'multipart/form-data' };
        }

        const response = await privateApi.put(`/book-club/${clubId}`, payload, { headers });
        return response.data;
    },

    deleteClub: async (clubId: string) => {
        const response = await privateApi.delete(`/book-club/${clubId}`);
        return response.data;
    },

    // Membership
    joinClub: async (clubId: string) => {
        const response = await privateApi.post(`/book-club/${clubId}/join`);
        return response.data;
    },

    leaveClub: async (clubId: string) => {
        const response = await privateApi.post(`/book-club/${clubId}/leave`);
        return response.data;
    },

    approveJoinRequest: async (clubId: string, userId: string) => {
        const response = await privateApi.post(`/book-club/${clubId}/approve/${userId}`);
        return response.data;
    },

    inviteUser: async (clubId: string, userId: string) => {
        const response = await privateApi.post(`/book-club/${clubId}/invite`, { userId });
        return response.data;
    },

    removeMember: async (clubId: string, userId: string) => {
        const response = await privateApi.delete(`/book-club/${clubId}/member/${userId}`);
        return response.data;
    },

    // Books
    setCurrentBook: async (clubId: string, bookData: {
        googleBookId: string;
        title: string;
        authors: string[];
        thumbnail: string;
        startDate: string;
        endDate: string;
    }) => {
        const response = await privateApi.put(`/book-club/${clubId}/current-book`, bookData);
        return response.data;
    },

    shareBook: async (clubId: string, bookData: {
        googleBookId: string;
        title: string;
        authors: string[];
        thumbnail: string;
    }) => {
        const response = await privateApi.post(`/book-club/${clubId}/share-book`, bookData);
        return response.data;
    },

    // Messages
    getMessages: async (clubId: string, params?: { limit?: number; before?: string }): Promise<{ messages: ClubMessage[] }> => {
        const response = await privateApi.get(`/book-club/${clubId}/messages`, { params });
        return response.data;
    },

    sendMessage: async (clubId: string, data: { content: string; type?: 'text' | 'book_share'; bookData?: any }) => {
        const response = await privateApi.post(`/book-club/${clubId}/message`, data);
        return response.data;
    },

    togglePinMessage: async (clubId: string, messageId: string) => {
        const response = await privateApi.put(`/book-club/${clubId}/message/${messageId}/pin`);
        return response.data;
    },

    deleteMessage: async (clubId: string, messageId: string) => {
        const response = await privateApi.delete(`/book-club/${clubId}/message/${messageId}`);
        return response.data;
    },
};
