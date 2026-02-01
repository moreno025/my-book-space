import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Book } from "../../hooks/Book/useHomeBooks";
import { Ionicons } from "@expo/vector-icons";

interface SocialSnippetProps {
    user: string;
    text: string;
    book: Book;
}

export function SocialSnippet({ user, text, book }: SocialSnippetProps) {
    const router = useRouter();

    if (!book) return null;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.userRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user.charAt(0)}</Text>
                    </View>
                    <Text style={styles.userName}>{user} says...</Text>
                </View>

                <Text style={styles.comment}>&ldquo;{text}&rdquo;</Text>

                <TouchableOpacity
                    style={styles.bookReference}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}
                >
                    <Image source={{ uri: book.coverUrl }} style={styles.miniCover} resizeMode="cover" />
                    <View style={styles.bookInfo}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>{book.authors[0]}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#475569" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginVertical: 12,
        marginBottom: 30, // For bottom spacing
    },
    card: {
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Nunito-Bold",
    },
    userName: {
        color: "#94A3B8",
        fontSize: 14,
        fontFamily: "Nunito-Bold",
    },
    comment: {
        fontSize: 18,
        fontFamily: "Nunito-BoldItalic",
        color: "#F1F5F9",
        lineHeight: 26,
        marginBottom: 20,
    },
    bookReference: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        padding: 10,
        borderRadius: 16,
        gap: 12,
    },
    miniCover: {
        width: 40,
        height: 56,
        borderRadius: 8,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#F1F5F9",
    },
    bookAuthor: {
        fontSize: 12,
        fontFamily: "Nunito-SemiBold",
        color: "#64748B",
    },
});
