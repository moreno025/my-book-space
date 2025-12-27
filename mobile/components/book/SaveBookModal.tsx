import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Animated,
    Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { bookListApi } from "../../constants/api";
import { BookList } from "../../types/bookList";
import { useUserLists } from "../../hooks/BookList/useUserList";
import { useAuth } from "../../hooks/useAuth";

interface SaveBookModalProps {
    visible: boolean;
    onClose: () => void;
    book: {
        id: string;
        title: string;
        authors: string[];
        coverUrl?: string;
        publishedDate?: string;
    } | null;
    onSuccess: (listName: string) => void;
    onError?: (message: string) => void;
    onCreateList: () => void;
}

export function SaveBookModal({
    visible,
    onClose,
    book,
    onSuccess,
    onError,
    onCreateList,
}: SaveBookModalProps) {
    const { user } = useAuth();
    const { lists, loading, refetch } = useUserLists({
        username: user?.username ?? "",
        enabled: visible && !!user?.username,
    });
    const [savingId, setSavingId] = useState<string | null>(null);

    const [fadeAnims] = useState(() => new Map<string, Animated.Value>());

    useEffect(() => {
        if (visible) {
            refetch();
        }
    }, [visible, refetch]);

    const handleSave = async (list: BookList) => {
        if (!book || !list._id) return;
        try {
            setSavingId(list._id);
            await bookListApi.addBookToList(list._id, {
                googleBookId: book.id,
                title: book.title,
                authors: book.authors,
                thumbnail: book.coverUrl || "",
                publishedDate: book.publishedDate,
            });
            onSuccess(list.title);
            onClose();
        } catch (error: any) {
            console.error("Failed to add book to list:", error);
            const message = error.response?.data?.message || "Failed to add book to list";
            onError?.(message);
        } finally {
            setSavingId(null);
        }
    };

    const renderItem = ({ item, index }: { item: BookList; index: number }) => {
        const isAlreadySaved = item.books.some(b => b.googleBookId === book?.id);

        if (!fadeAnims.has(item._id)) {
            fadeAnims.set(item._id, new Animated.Value(0));
        }
        const fadeAnim = fadeAnims.get(item._id)!;

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }).start();

        return (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <TouchableOpacity
                    style={[styles.listItem, isAlreadySaved && styles.listItemDisabled]}
                    onPress={() => !isAlreadySaved && handleSave(item)}
                    disabled={savingId !== null || isAlreadySaved}
                >
                    <View style={styles.listIconContainer}>
                        <Ionicons
                            name={isAlreadySaved ? "checkmark-circle" : "list"}
                            size={20}
                            color={isAlreadySaved ? "#10B981" : "#3B82F6"}
                        />
                    </View>
                    <View style={styles.listInfo}>
                        <Text style={[styles.listTitle, isAlreadySaved && styles.listTitleDisabled]}>
                            {item.title}
                        </Text>
                        <Text style={styles.listCount}>
                            {item.books.length} {item.books.length === 1 ? "book" : "books"}
                        </Text>
                    </View>
                    {isAlreadySaved ? (
                        <Text style={styles.savedBadge}>Saved</Text>
                    ) : savingId === item._id ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                        <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                </BlurView>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>Save to List</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading && !lists.length ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <FlatList
                            data={lists}
                            keyExtractor={(item) => item._id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={() => {
                                        onClose();
                                        onCreateList();
                                    }}
                                >
                                    <View style={[styles.listIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                                        <Ionicons name="add" size={24} color="#10B981" />
                                    </View>
                                    <Text style={styles.createButtonText}>Create New List</Text>
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={
                                !loading ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>{"You haven't created any lists yet."}</Text>
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        flex: 1,
    },
    container: {
        backgroundColor: "#111827",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: "80%",
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#374151",
        borderRadius: 2,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    listItemDisabled: {
        opacity: 0.8,
    },
    listIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    listInfo: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    listTitleDisabled: {
        color: "#9CA3AF",
    },
    listCount: {
        fontSize: 13,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
        marginTop: 2,
    },
    savedBadge: {
        fontSize: 12,
        fontWeight: "600",
        color: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontFamily: "Nunito-Bold",
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        marginBottom: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#10B981",
        fontFamily: "Nunito-Bold",
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 15,
        fontFamily: "Nunito-Regular",
    },
});
