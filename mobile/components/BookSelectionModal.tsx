import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBookSearch } from "@/hooks/Search/useBookSearch";
import { Book } from "@/types/book";

interface BookSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectBook: (book: Book) => void;
}

export default function BookSelectionModal({
    visible,
    onClose,
    onSelectBook,
}: BookSelectionModalProps) {
    const [query, setQuery] = useState("");
    const { books, loading, hasSearched } = useBookSearch(query);

    const handleSelectBook = (book: Book) => {
        onSelectBook(book);
        setQuery("");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Book</Text>
                    <View style={styles.closeButton} />
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a book..."
                        placeholderTextColor="#6B7280"
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                )}

                {!loading && query.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color="#4B5563" />
                        <Text style={styles.emptyStateTitle}>Search for a book</Text>
                        <Text style={styles.emptyStateText}>
                            Type the title or author to find the book you want to set as current
                        </Text>
                    </View>
                )}

                {!loading && hasSearched && books.length === 0 && query.length > 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={64} color="#4B5563" />
                        <Text style={styles.emptyStateTitle}>No books found</Text>
                        <Text style={styles.emptyStateText}>
                            Try searching with a different title or author
                        </Text>
                    </View>
                )}

                {!loading && books.length > 0 && (
                    <FlatList
                        data={books}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bookCard}
                                onPress={() => handleSelectBook(item as any)}
                            >
                                <Image
                                    source={{ uri: item.coverUrl?.replace("http:", "https:") }}
                                    style={styles.bookCover}
                                    resizeMode="cover"
                                />
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.bookAuthors} numberOfLines={1}>
                                        {item.authors?.join(", ") || "Unknown Author"}
                                    </Text>
                                    {item.publishedDate && (
                                        <Text style={styles.bookYear}>
                                            {new Date(item.publishedDate).getFullYear()}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 20,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#F9FAFB",
        fontFamily: "Nunito-Regular",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        marginTop: 16,
        fontFamily: "Nunito-Bold",
    },
    emptyStateText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
        fontFamily: "Nunito-Regular",
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    bookCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    bookCover: {
        width: 60,
        height: 90,
        borderRadius: 8,
        backgroundColor: "#374151",
        marginRight: 12,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 4,
        fontFamily: "Nunito-SemiBold",
    },
    bookAuthors: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 2,
        fontFamily: "Nunito-Regular",
    },
    bookYear: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: "Nunito-Regular",
    },
});
