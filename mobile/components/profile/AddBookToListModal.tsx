import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBookSearch } from "../../hooks/Search/useBookSearch";
import { bookListApi } from "../../constants/api";
import { useAppFonts } from "../../hooks/useFonts";

interface AddBookToListModalProps {
    visible: boolean;
    onClose: () => void;
    listId: string | null;
    onBookAdded: () => void;
}

export function AddBookToListModal({ visible, onClose, listId, onBookAdded }: AddBookToListModalProps) {
    const [query, setQuery] = useState("");
    const { books, loading } = useBookSearch(query);
    const [addingBookId, setAddingBookId] = useState<string | null>(null);
    const fontsLoaded = useAppFonts();

    const handleAddBook = async (book: any) => {
        if (!listId) return;
        try {
            setAddingBookId(book.id);
            await bookListApi.addBookToList(listId, {
                googleBookId: book.id,
                title: book.title,
                authors: book.authors,
                thumbnail: book.coverUrl,
                publishedDate: book.publishedDate,
            });
            setQuery(""); // Reset search
            onBookAdded(); // Refresh parent list
            onClose();
        } catch (error) {
            console.error("Failed to add book to list", error);
            // Optionally show an alert here
        } finally {
            setAddingBookId(null);
        }
    };

    const handleClose = () => {
        setQuery("");
        onClose();
    };

    if (!fontsLoaded) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardWrapper}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Add to List</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a book..."
                                placeholderTextColor="#6B7280"
                                value={query}
                                onChangeText={setQuery}
                                autoFocus={visible}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery("")}>
                                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                            </View>
                        ) : (
                            <FlatList
                                data={books}
                                keyExtractor={(item) => item.id}
                                style={styles.list}
                                contentContainerStyle={styles.listContent}
                                keyboardShouldPersistTaps="handled"
                                ListEmptyComponent={
                                    query.length > 0 ? (
                                        <View style={styles.centerContainer}>
                                            <Text style={styles.emptyText}>No books found</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.centerContainer}>
                                            <Text style={styles.emptyText}>Type to search books</Text>
                                        </View>
                                    )
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.bookItem}
                                        onPress={() => handleAddBook(item)}
                                        disabled={addingBookId === item.id}
                                    >
                                        <Image
                                            source={{ uri: item.coverUrl || "https://via.placeholder.com/128x196?text=No+Cover" }}
                                            style={styles.bookCover}
                                        />
                                        <View style={styles.bookInfo}>
                                            <Text style={styles.bookTitle} numberOfLines={2}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.bookAuthor} numberOfLines={1}>
                                                {item.authors[0] || "Unknown Author"}
                                            </Text>
                                        </View>
                                        <View style={styles.addButton}>
                                            {addingBookId === item.id ? (
                                                <ActivityIndicator size="small" color="#3B82F6" />
                                            ) : (
                                                <Ionicons name="add-circle-outline" size={28} color="#3B82F6" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end", // Bottom sheet style
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    keyboardWrapper: {
        width: "100%",
    },
    container: {
        backgroundColor: "#111827",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "80%", // Take up 80% of screen height
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: "#F9FAFB",
        fontSize: 16,
        fontFamily: "Nunito-Regular",
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 14,
        fontFamily: "Nunito-Medium",
    },
    bookItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    bookCover: {
        width: 48,
        height: 72,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: "#374151",
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 4,
        fontFamily: "Nunito-Bold",
    },
    bookAuthor: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    addButton: {
        padding: 8,
    },
});
