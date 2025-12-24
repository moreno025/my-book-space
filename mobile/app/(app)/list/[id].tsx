import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUserLists } from "../../../hooks/BookList/useUserList";
import { useAuth } from "../../../hooks/useAuth";
import { BookListBook } from "../../../types/bookList";
import { bookListApi } from "../../../constants/api";
import { useAppFonts } from "../../../hooks/useFonts";

const COVER_WIDTH = 60;
const COVER_HEIGHT = 90;

export default function ListDetailScreen() {
    const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { lists, refetch } = useUserLists({ username: user?.username || "" });
    const fontsLoaded = useAppFonts();

    if (!fontsLoaded) return null;

    const currentList = lists.find(l => l._id === id);

    const handleDeleteBook = async (book: BookListBook) => {
        Alert.alert(
            "Remove Book",
            `Are you sure you want to remove "${book.title}" from this list?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await bookListApi.removeBookFromList(id, book.googleBookId);
                            refetch();
                        } catch (error) {
                            console.error("Failed to remove book", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{title || "List Details"}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={currentList?.books || []}
                keyExtractor={(item) => item.googleBookId}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.bookRow}>
                        <TouchableOpacity
                            style={styles.bookInfo}
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({ pathname: "/book/[id]", params: { id: item.googleBookId } });
                            }}
                        >
                            <Image
                                source={{ uri: item.thumbnail }}
                                style={styles.cover}
                                resizeMode="cover"
                            />
                            <View style={styles.textContainer}>
                                <Text numberOfLines={1} style={styles.bookTitle}>{item.title}</Text>
                                <Text numberOfLines={1} style={styles.bookAuthor}>
                                    {item.authors?.[0] || "Unknown"}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteBook(item)}
                        >
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No books in this list yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1F2937",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 12,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    bookRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    bookInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    cover: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        borderRadius: 8,
        backgroundColor: "#111827",
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#F9FAFB",
        marginBottom: 4,
        fontFamily: "Nunito-Bold",
    },
    bookAuthor: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
});
