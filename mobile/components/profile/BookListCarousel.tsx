import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookListBook } from "../../types/bookList";
import { useAppFonts } from "../../hooks/useFonts";
import { bookListApi } from "../../constants/api";
import { BookOptionsModal } from "./BookOptionsModal";
import { ListOptionsModal } from "./ListOptionsModal";
import { useAuth } from "../../hooks/useAuth";

interface BookListCarouselProps {
    title: string;
    listId: string;
    isPublic: boolean;
    ownerId: string; // ID of the list creator
    books: BookListBook[];
    onAddBook?: () => void;
    onRefresh?: () => void;
    onUnsave?: (listId: string) => void;
    onRename?: (listId: string, currentTitle: string) => void;
    onToggleVisibility?: (listId: string, currentIsPublic: boolean) => void;
}

// const { width } = Dimensions.get("window"); // Unused for now
const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;

export function BookListCarousel({ title, listId, isPublic, ownerId, books, onAddBook, onRefresh, onUnsave, onRename, onToggleVisibility }: BookListCarouselProps) {
    const router = useRouter();
    const { user } = useAuth();
    const fontsLoaded = useAppFonts();

    const isOwner = user?.id === ownerId;

    const [selectedBook, setSelectedBook] = useState<BookListBook | null>(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showListOptionsModal, setShowListOptionsModal] = useState(false);

    if (!fontsLoaded) return null;

    const handleWriteReview = (book: BookListBook) => {
        router.push({
            pathname: "/book/[id]",
            params: { id: book.googleBookId, writeReview: "true" }
        });
    };

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
                            await bookListApi.removeBookFromList(listId, book.googleBookId);
                            onRefresh?.();
                        } catch (error) {
                            console.error("Failed to remove book", error);
                        }
                    }
                }
            ]
        );
    };

    const confirmDeleteList = () => {
        Alert.alert(
            "Delete List",
            `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await bookListApi.deleteBookList(listId);
                            onRefresh?.();
                        } catch (error) {
                            console.error("Failed to delete list", error);
                            Alert.alert("Error", "Could not delete the list. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const confirmUnsaveList = () => {
        Alert.alert(
            "Remove List",
            `Are you sure you want to remove "${title}" from your profile?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        onUnsave?.(listId);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {!isPublic && (
                        <Ionicons
                            name="lock-closed"
                            size={16}
                            color="#9CA3AF"
                            style={{ marginLeft: 8 }}
                        />
                    )}
                    <TouchableOpacity onPress={() => setShowListOptionsModal(true)} style={styles.optionsButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                {books.length > 0 && (
                    <TouchableOpacity onPress={() => router.push({ pathname: "/list/[id]", params: { id: listId, title } })}>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {books.length === 0 ? (
                <TouchableOpacity
                    style={styles.emptyContainer}
                    onPress={onAddBook}
                    activeOpacity={0.7}
                >
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="add" size={24} color="#3B82F6" />
                    </View>
                    <Text style={styles.emptyText}>Add your first book</Text>
                </TouchableOpacity>
            ) : (
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    data={books}
                    keyExtractor={(item) => item.googleBookId}
                    ListFooterComponent={
                        onAddBook ? (
                            <TouchableOpacity
                                style={[styles.card, styles.addCard]}
                                activeOpacity={0.7}
                                onPress={onAddBook}
                            >
                                <View style={styles.addCoverContainer}>
                                    <Ionicons name="add" size={40} color="#3B82F6" />
                                </View>
                                <Text numberOfLines={1} style={styles.bookTitle}>Add book</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({ pathname: "/book/[id]", params: { id: item.googleBookId } });
                            }}
                            onLongPress={() => {
                                setSelectedBook(item);
                                setShowOptionsModal(true);
                            }}
                        >
                            <View style={styles.coverContainer}>
                                <Image
                                    source={{ uri: item.thumbnail }}
                                    style={styles.cover}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
                            <Text numberOfLines={1} style={styles.bookAuthor}>
                                {item.authors?.[0] || "Unknown Author"}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <BookOptionsModal
                visible={showOptionsModal}
                onClose={() => setShowOptionsModal(false)}
                bookTitle={selectedBook?.title || ""}
                onWriteReview={() => selectedBook && handleWriteReview(selectedBook)}
                onDelete={() => selectedBook && handleDeleteBook(selectedBook)}
            />

            <ListOptionsModal
                visible={showListOptionsModal}
                onClose={() => setShowListOptionsModal(false)}
                listTitle={title}
                isPublic={isPublic}
                isOwner={isOwner}
                onRename={() => onRename?.(listId, title)}
                onToggleVisibility={() => onToggleVisibility?.(listId, isPublic)}
                onDelete={isOwner ? confirmDeleteList : confirmUnsaveList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
        marginTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    optionsButton: {
        marginLeft: 8,
        padding: 4,
    },
    seeAll: {
        fontSize: 14,
        color: "#3B82F6",
        fontWeight: "600",
    },
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        width: CARD_WIDTH,
        marginRight: 16,
    },
    coverContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        backgroundColor: "#1F2937",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cover: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 4,
        lineHeight: 20,
    },
    bookAuthor: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    emptyContainer: {
        marginHorizontal: 20,
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#1F2937",
        borderStyle: "dashed",
    },
    emptyIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    emptyText: {
        color: "#3B82F6",
        fontSize: 14,
        fontWeight: "600",
    },
    addCard: {
        justifyContent: 'flex-start',
    },
    addCoverContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
});
