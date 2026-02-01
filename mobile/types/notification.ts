import { User } from "./user";

export interface Notification {
    _id: string;
    recipient: string;
    sender: User;
    type: 'collaborator_added';
    data: {
        listId?: string;
        listTitle?: string;
        [key: string]: any;
    };
    isRead: boolean;
    createdAt: string;
}
