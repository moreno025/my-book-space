export interface BookClub {
    _id: string;
    name: string;
    description: string;
    admin: {
        _id: string;
        username: string;
        avatar?: string;
    };
    members: {
        _id: string;
        username: string;
        avatar?: string;
    }[];
    pendingInvites?: {
        _id: string;
        username: string;
        avatar?: string;
    }[];
    visibility: 'public' | 'private';
    currentBook?: {
        googleBookId: string;
        title: string;
        authors: string[];
        thumbnail: string;
        startDate: string;
        endDate: string;
    };
    pastBooks: {
        googleBookId: string;
        title: string;
        authors: string[];
        thumbnail: string;
        startDate: string;
        endDate: string;
        archivedAt: string;
    }[];
    sharedBooks: {
        googleBookId: string;
        title: string;
        authors: string[];
        thumbnail: string;
        sharedBy: string;
        sharedAt: string;
    }[];
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}
