import { useState } from "react";
import { bookClubApi } from "@/constants/api/bookClub";
import { useSocket } from "@/context/SocketContext";

export const useSendMessage = (clubId: string) => {
    const [sending, setSending] = useState(false);
    const { socket } = useSocket();

    const sendMessage = async (content: string) => {
        try {
            setSending(true);
            const response = await bookClubApi.sendMessage(clubId, {
                content,
                type: "text",
            });

            // Emit socket event to notify other users
            if (socket) {
                socket.emit("new_message", {
                    clubId,
                    message: response.data,
                });
            }

            return response.data;
        } catch (error: any) {
            console.error("Error sending message:", error);
            throw new Error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return {
        sendMessage,
        sending,
    };
};
