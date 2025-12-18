import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookGrid } from "../../../components/book/BookGrid";
import { booksApi } from "../../../constants/api";
import { useAppFonts } from "../../../hooks/useFonts";
import { BookGridSkeleton } from "../../../components/skeleton/BookGridSkeleton";

export default function SearchScreen() {
    const router = useRouter();
    const fontsLoaded = useAppFonts();

    const [query, setQuery] = useState("");
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    /* ================= LOAD HISTORY ================= */
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await booksApi.getHistory();
                setHistory(res.data.map((h: any) => h.query));
            } catch (err) {
                console.error(err);
            }
        };
        loadHistory();
    }, []);

    const insets = useSafeAreaInsets();

    /* ================= SEARCH ================= */
    useEffect(() => {
        if (query.trim().length === 0) {
            setBooks([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            try {
                const res = await booksApi.searchBooks(query, controller.signal);
                const items = res.data.items ?? [];

                const mapped = items.map((item: any) => ({
                    id: item.id,
                    coverUrl: item.volumeInfo.imageLinks?.thumbnail,
                    rating: item.volumeInfo.averageRating,
                }));

                setBooks(mapped);
                setHasSearched(true);
            } catch (err: any) {
                if (err.name !== "CanceledError") {
                    console.error(err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 800);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);


    /* ================= HANDLE BOOK PRESS ================= */
    const handleBookPress = async (id: string) => {
        try {
            if (query.length >= 3) {
                await booksApi.saveHistory(query);
                const updated = await booksApi.getHistory();
                setHistory(updated.data.map((h: any) => h.query));
            }
        } catch (err) {
            console.error("Error saving search history:", err);
        }

        router.push({ pathname: "/book/[id]", params: { id } });
    };

    if (!fontsLoaded) return null;

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* CUSTOM HEADER */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>

                <View style={styles.headerSearch}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />

                    <TextInput
                        placeholder="Search books..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.headerInput}
                        value={query}
                        onChangeText={(text) => {
                            setQuery(text);
                            setHasSearched(false);

                            if (text.trim().length > 0) {
                                setLoading(true);
                            }
                        }}
                        autoFocus
                    />

                    {query.length > 0 && (
                        <View style={styles.clearButtonContainer}>
                            <Ionicons
                                name="close-circle"
                                size={28}
                                color="#9CA3AF"
                                onPress={() => {
                                    setQuery("");
                                    setBooks([]);
                                    setHasSearched(false);
                                }}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* SEARCH HISTORY */}
            {query.length === 0 && history.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Recent searches</Text>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await booksApi.clearHistory();
                                    setHistory([]);
                                } catch (err) {
                                    console.error("Error clearing history:", err);
                                }
                            }}
                        >
                            <Ionicons name="trash-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    {history.map((item) => (
                        <View key={item} style={styles.historyRow}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => {
                                    setQuery(item);
                                    setHasSearched(false);
                                }}
                            >
                                <Text style={styles.historyText}>{item}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        await booksApi.deleteHistoryItem(item);
                                        setHistory((prev) => prev.filter((h) => h !== item));
                                    } catch (err) {
                                        console.error("Error deleting item:", err);
                                    }
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close-outline" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {loading && <BookGridSkeleton />}

            {!loading && books.length > 0 && (
                <BookGrid books={books} onBookPress={handleBookPress} />
            )}

            {!loading && query.length > 1 && books.length === 0 && hasSearched && (
                <Text style={styles.empty}>No results found</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F6F6" },

    customHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    backButton: {
        marginRight: 12,
    },
    headerSearch: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111827",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },

    headerInput: {
        flex: 1,
        marginLeft: 8,
        color: "#F9FAFB",
        fontSize: 16,
        paddingVertical: 6,
    },

    clearButtonContainer: {
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    empty: { marginTop: 32, textAlign: "center", color: "#6B7280" },
    historyContainer: { marginTop: 24, marginHorizontal: 16 },
    historyTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
    historyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    historyText: {
        fontSize: 16,
        color: "#111827",
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
});
