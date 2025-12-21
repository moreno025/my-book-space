import { useRouter } from "expo-router";
import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Book } from "../../types/book";
import { useRelatedBooks } from "../../hooks/Book/useRelatedBooks";

interface RelatedBookCarouselProps {
    currentBook: Book | null;
}

export function RelatedBookCarousel({ currentBook }: RelatedBookCarouselProps) {
    const router = useRouter();
    const { relatedBooks, loading } = useRelatedBooks(currentBook);

    if (!currentBook) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Related books</Text>

            {loading ? (
                <ActivityIndicator size="small" color="#F9FAFB" />
            ) : relatedBooks.length > 0 ? (
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={relatedBooks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                router.push({ pathname: "/book/[id]", params: { id: item.id } })
                            }
                        >
                            <Image source={{ uri: item.coverUrl ?? undefined }} style={styles.cover} />
                            <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noBooks}>No related books found.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 32, paddingHorizontal: 20 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#F9FAFB" },
    card: { width: 110, marginRight: 16 },
    cover: { width: 110, height: 165, borderRadius: 12, backgroundColor: "#9CA3AF" },
    bookTitle: { marginTop: 6, fontSize: 14, fontWeight: "600", color: "#E5E7EB" },
    noBooks: { color: "#E5E7EB", fontSize: 14 },
});
