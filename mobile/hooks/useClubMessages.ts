import { useState, useEffect, useCallback } from "react";
import { bookClubApi } from "@/constants/api/bookClub";
import { ClubMessage } from "@/types/clubMessage";
import { useSocket } from "@/context/SocketContext";

export const useClubMessages = (clubId: string) => {
    const [messages, setMessages] = useState<ClubMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { socket, isConnected } = useSocket();

    // Fetch initial messages
    const fetchMessages = useCallback(async (before?: string) => {
        try {
            setLoading(true);
            const { messages: fetchedMessages } = await bookClubApi.getMessages(clubId, {
                limit: 50,
                before,
            });

            if (before) {
                // Loading more messages (prepend to list)
                setMessages((prev) => [...fetchedMessages, ...prev]);
            } else {
                // Initial load
                setMessages(fetchedMessages);
            }

            setHasMore(fetchedMessages.length === 50);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [clubId]);

    // Load more messages (pagination)
    const loadMore = useCallback(() => {
        if (loading || !hasMore || messages.length === 0) return;
        const oldestMessage = messages[0];
        fetchMessages(oldestMessage.createdAt);
    }, [loading, hasMore, messages, fetchMessages]);

    // Handle real-time message received
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join the club room
        socket.emit("join_club", clubId);

        // Listen for new messages
        const handleMessageReceived = (message: ClubMessage) => {
            setMessages((prev) => [...prev, message]);
        };

        // Listen for deleted messages
        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        // Listen for pinned messages
        const handleMessagePinned = ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, isPinned } : msg))
            );
        };

        socket.on("message_received", handleMessageReceived);
        socket.on("message_deleted", handleMessageDeleted);
        socket.on("message_pinned", handleMessagePinned);

        // Cleanup
        return () => {
            socket.emit("leave_club", clubId);
            socket.off("message_received", handleMessageReceived);
            socket.off("message_deleted", handleMessageDeleted);
            socket.off("message_pinned", handleMessagePinned);
        };
    }, [socket, isConnected, clubId]);

    // Fetch messages on mount
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        loading,
        hasMore,
        loadMore,
        refetch: () => fetchMessages(),
    };
};
