import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClubMessage } from "@/types/clubMessage";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/utils/images";

interface ChatMessageProps {
    message: ClubMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const { user } = useAuth();
    const isOwnMessage = user?._id === message.sender._id;
    const isSystemMessage = message.type === "system";

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    // System messages (member joined, book set, etc.)
    if (isSystemMessage) {
        return (
            <View style={styles.systemMessageContainer}>
                <View style={styles.systemMessageBubble}>
                    <Ionicons name="information-circle" size={14} color="#9CA3AF" />
                    <Text style={styles.systemMessageText}>{message.content}</Text>
                </View>
                <Text style={styles.systemMessageTime}>{formatTime(message.createdAt)}</Text>
            </View>
        );
    }

    // Book share messages
    if (message.type === "book_share" && message.bookData) {
        return (
            <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                {!isOwnMessage && (
                    <Image
                        source={{ uri: getImageUrl(message.sender.avatar) || "https://via.placeholder.com/40" }}
                        style={styles.avatar}
                    />
                )}
                <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
                    {!isOwnMessage && (
                        <Text style={styles.senderName}>{message.sender.username}</Text>
                    )}
                    <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                        {message.content}
                    </Text>
                    <View style={styles.bookCard}>
                        {message.bookData.thumbnail && (
                            <Image
                                source={{ uri: message.bookData.thumbnail }}
                                style={styles.bookThumbnail}
                            />
                        )}
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {message.bookData.title}
                            </Text>
                            <Text style={styles.bookAuthors} numberOfLines={1}>
                                {message.bookData.authors.join(", ")}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
                        {formatTime(message.createdAt)}
                    </Text>
                </View>
                {isOwnMessage && <View style={styles.avatarPlaceholder} />}
            </View>
        );
    }

    // Regular text messages
    return (
        <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
            {!isOwnMessage && (
                <Image
                    source={{ uri: getImageUrl(message.sender.avatar) || "https://via.placeholder.com/40" }}
                    style={styles.avatar}
                />
            )}
            <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
                {!isOwnMessage && (
                    <Text style={styles.senderName}>{message.sender.username}</Text>
                )}
                <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                    {message.content}
                </Text>
                <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
                    {formatTime(message.createdAt)}
                </Text>
            </View>
            {isOwnMessage && <View style={styles.avatarPlaceholder} />}
        </View>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        marginBottom: 12,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
    ownMessageContainer: {
        flexDirection: "row-reverse",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: "#374151",
    },
    avatarPlaceholder: {
        width: 32,
        marginLeft: 8,
    },
    messageBubble: {
        maxWidth: "75%",
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 12,
        borderBottomLeftRadius: 4,
    },
    ownMessageBubble: {
        backgroundColor: "#3B82F6",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 4,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#3B82F6",
        marginBottom: 4,
        fontFamily: "Nunito-SemiBold",
    },
    messageText: {
        fontSize: 15,
        color: "#F9FAFB",
        lineHeight: 20,
        fontFamily: "Nunito-Regular",
    },
    ownMessageText: {
        color: "#FFFFFF",
    },
    messageTime: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 4,
        fontFamily: "Nunito-Regular",
    },
    ownMessageTime: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    systemMessageContainer: {
        alignItems: "center",
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    systemMessageBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    systemMessageText: {
        fontSize: 13,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    systemMessageTime: {
        fontSize: 10,
        color: "#6B7280",
        marginTop: 2,
        fontFamily: "Nunito-Regular",
    },
    bookCard: {
        flexDirection: "row",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
        gap: 10,
    },
    bookThumbnail: {
        width: 50,
        height: 75,
        borderRadius: 4,
        backgroundColor: "#374151",
    },
    bookInfo: {
        flex: 1,
        justifyContent: "center",
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 4,
        fontFamily: "Nunito-SemiBold",
    },
    bookAuthors: {
        fontSize: 12,
        color: "#D1D5DB",
        fontFamily: "Nunito-Regular",
    },
});
