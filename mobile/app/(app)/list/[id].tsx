import React, { useContext, useState, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useListDetail } from "../../../hooks/BookList/useListDetail";
import { useAppFonts } from "../../../hooks/useFonts";
import { getImageUrl } from "@/utils/url";
import { bookListApi } from "../../../constants/api";
import { useToast } from "../../../context/ToastContext";
import { AuthContext } from "../../../context/AuthContext";
import { ListDetailHeader } from "../../../components/list/ListDetailHeader";
import { BookListBook } from "../../../types/bookList";
import { BookGrid } from "../../../components/book/BookGrid";

import { BookOptionsModal } from "../../../components/profile/BookOptionsModal";

export default function ListDetailScreen() {
    const { id, view } = useLocalSearchParams<{ id: string, view?: 'management' | 'discovery' }>();
    const router = useRouter();
    const { list, loading, error, refetch } = useListDetail(id);
    const fontsLoaded = useAppFonts();
    const { showToast } = useToast();
    const { user } = useContext(AuthContext);
    const [isSaving, setIsSaving] = useState(false);
    // const [statusModalVisible, setStatusModalVisible] = useState(false); // Removed
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookListBook | null>(null);

    const isDiscovery = view === 'discovery';
    const isOwnList = !!(list?.user?._id && list.user._id === user?.id);
    const isAlreadySaved = !!(list?.savedBy && list.savedBy.includes(user?.id || ""));

    const handleSaveList = useCallback(async () => {
        if (!list) return;
        try {
            setIsSaving(true);

            if (isAlreadySaved) {
                // Unsave the list
                await bookListApi.unsaveList(list._id);
                showToast("List removed from your profile", "success");
            } else {
                // Save the list
                await bookListApi.saveList(list._id);
                showToast("List saved to your profile!", "success");
            }

            await refetch();
        } catch (err: any) {
            console.error(err);
            const action = isAlreadySaved ? "remove" : "save";
            showToast(err.response?.data?.message || `Failed to ${action} list`, "error");
        } finally {
            setIsSaving(false);
        }
    }, [list, isAlreadySaved, refetch, showToast]);

    const handleCopyList = useCallback(async () => {
        if (!list) return;
        try {
            await bookListApi.copyList(list._id);
            showToast("List copied to your profile!", "success");
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || "Failed to copy list", "error");
        }
    }, [list, showToast]);

    const handleUsernamePress = useCallback(() => {
        if (!list?.user) return;
        if (isOwnList) {
            router.push("/profile");
        } else {
            router.push({
                pathname: "/(app)/(tabs)/user/[username]",
                params: { username: list.user.username }
            });
        }
    }, [list?.user, isOwnList, router]);

    const handleDeleteBook = useCallback(async (book: BookListBook) => {
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
                            showToast("Book removed from list", "success");
                            refetch();
                        } catch (err) {
                            console.error("Failed to remove book", err);
                            showToast("Failed to remove book", "error");
                        }
                    }
                }
            ]
        );
    }, [id, refetch, showToast]);

    const handleStatusChange = useCallback(async (status: "not read" | "reading" | "read") => {
        if (!selectedBook || !list) return;
        try {
            await bookListApi.updateBookStatus(list._id, selectedBook.googleBookId, status);
            showToast(`Status updated to "${status}"`, "success");
            refetch();
        } catch (err) {
            console.error("Failed to update status", err);
            showToast("Failed to update status", "error");
        }
    }, [selectedBook, list, refetch, showToast]);

    const handleLongPress = useCallback((book: BookListBook) => {
        if (!isOwnList || isDiscovery) return;
        setSelectedBook(book);
        setOptionsModalVisible(true);
    }, [isOwnList, isDiscovery]);

    // const handleOpenStatusModal = ... // Removed

    const avatarUrl = useMemo(() => {
        if (!list?.user?.avatar) return null;
        return getImageUrl(list.user.avatar);
    }, [list?.user?.avatar]);

    const mappedBooks = useMemo(() => {
        if (!list) return [];
        return list.books.map(b => ({
            id: b.googleBookId,
            coverUrl: b.thumbnail,
            readingStatus: b.readingStatus,
        }));
    }, [list]);

    const StatusBadge = ({ status }: { status: "not read" | "reading" | "read" }) => {
        const config = {
            "not read": { icon: "book-outline", color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" },
            "reading": { icon: "book", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
            "read": { icon: "checkmark-circle", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
        }[status];

        return (
            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon as any} size={12} color={config.color} />
            </View>
        );
    };

    const renderBookItem = ({ item }: { item: BookListBook }) => (
        <TouchableOpacity
            style={styles.bookRow}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: "/book/[id]", params: { id: item.googleBookId } })}
            onLongPress={() => handleLongPress(item)}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.bookThumbnail}
                resizeMode="cover"
            />
            <View style={styles.bookInfo}>
                <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.bookAuthor}>{item.authors?.[0] || "Unknown author"}</Text>

                <View style={styles.badgeRow}>
                    <StatusBadge status={item.readingStatus || "not read"} />
                    <View style={styles.reviewBadge}>
                        <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
                        <Text style={styles.reviewText}>
                            {(item.myReviewCount || 0) === 0
                                ? "No reviews"
                                : `${item.myReviewCount} review${(item.myReviewCount || 0) > 1 ? 's' : ''}`}
                        </Text>
                    </View>
                </View>
            </View>

            {isOwnList && !isDiscovery && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteBook(item)}
                >
                    <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    if (!fontsLoaded || (loading && !list)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (error || !list) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || "List not found"}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const ListHeader = () => (
        <ListDetailHeader
            list={list}
            avatarUrl={avatarUrl}
            isOwnList={isOwnList}
            isAlreadySaved={isAlreadySaved}
            isSaving={isSaving}
            onSave={handleSaveList}
            onBack={() => router.back()}
            onCopy={handleCopyList}
            onUsernamePress={handleUsernamePress}
        />
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0F172A", "#1E293B"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe} edges={["top"]}>
                {isDiscovery ? (
                    <BookGrid
                        books={mappedBooks}
                        onBookPress={(bookId) => router.push({ pathname: "/book/[id]", params: { id: bookId } })}
                        ListHeaderComponent={ListHeader}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <FlatList
                        data={list.books}
                        keyExtractor={(item) => item.googleBookId}
                        renderItem={renderBookItem}
                        ListHeaderComponent={ListHeader}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="book-outline" size={48} color="#4B5563" />
                                <Text style={styles.emptyText}>This list is currently empty.</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>

            {/* BookStatusModal removed */}

            <BookOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                bookTitle={selectedBook?.title || ""}
                currentStatus={selectedBook?.readingStatus || "not read"}
                onStatusChange={handleStatusChange}
                onDelete={() => {
                    if (selectedBook) {
                        setOptionsModalVisible(false);
                        setTimeout(() => handleDeleteBook(selectedBook), 300);
                    }
                }}
                onWriteReview={() => {
                    if (selectedBook) {
                        setOptionsModalVisible(false);
                        router.push({ pathname: "/book/[id]", params: { id: selectedBook.googleBookId } });
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    safe: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0F172A",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#0F172A",
    },
    errorText: {
        color: "#F9FAFB",
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        textAlign: "center",
        marginBottom: 20,
    },
    backLink: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#2563EB",
        borderRadius: 8,
    },
    backLinkText: {
        color: "#FFFFFF",
        fontFamily: "Nunito-Bold",
    },
    listContent: {
        paddingBottom: 40,
    },
    bookRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    bookThumbnail: {
        width: 50,
        height: 75,
        borderRadius: 6,
        backgroundColor: "#1E293B",
    },
    bookInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
    },
    bookTitle: {
        color: "#F9FAFB",
        fontSize: 15,
        fontFamily: "Nunito-Bold",
        marginBottom: 2,
    },
    bookAuthor: {
        color: "#94A3B8",
        fontSize: 13,
        fontFamily: "Nunito-Medium",
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    statusBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    reviewBadge: {
        flexDirection: "row",
        alignItems: "center",
    },
    reviewText: {
        color: "#94A3B8",
        fontSize: 12,
        fontFamily: "Nunito-Medium",
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontFamily: "Nunito-Medium",
        marginTop: 12,
    },
});
