export interface MessageSender {
    _id: string;
    username: string;
    avatar?: string;
}

export interface BookData {
    googleBookId: string;
    title: string;
    authors: string[];
    thumbnail?: string;
}

export interface ClubMessage {
    _id: string;
    club: string;
    sender: MessageSender;
    content: string;
    type: 'text' | 'book_share' | 'system';
    bookData?: BookData;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}
