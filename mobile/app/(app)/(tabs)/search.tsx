import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../../hooks/useAuth";
import { useBookSearch } from "../../../hooks/Search/useBookSearch";
import { useSearchHistory } from "../../../hooks/Search/useSearchHistory";

import { BookGrid } from "../../../components/book/BookGrid";
import { BookGridSkeleton } from "../../../components/skeleton/BookGridSkeleton";
import { useAppFonts } from "../../../hooks/useFonts";

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const fontsLoaded = useAppFonts();

    const { token } = useAuth();

    const [query, setQuery] = useState("");

    const { books, loading, hasSearched } = useBookSearch(query);
    const { history, save, remove, clear } = useSearchHistory(token);

    const handleBookPress = async (id: string) => {
        await save(query);
        router.push({ pathname: "/book/[id]", params: { id } });
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* HEADER */}
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
                        onChangeText={setQuery}
                        autoFocus
                    />

                    {query.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButtonContainer}
                            onPress={() => setQuery("")}
                        >
                            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* SEARCH HISTORY */}
            {query.length === 0 && history.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Recent searches</Text>

                        <TouchableOpacity onPress={clear}>
                            <Ionicons name="trash-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {history.map((item) => (
                        <View key={item} style={styles.historyRow}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => setQuery(item)}
                            >
                                <Text style={styles.historyText}>{item}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => remove(item)}>
                                <Ionicons name="close-outline" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* RESULTS */}
            {loading && <BookGridSkeleton />}

            {!loading && books.length > 0 && (
                <BookGrid
                    books={books}
                    onBookPress={handleBookPress}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                />
            )}

            {!loading && hasSearched && books.length === 0 && query.length > 1 && (
                <Text style={styles.empty}>No results found</Text>
            )}
        </SafeAreaView>
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

    empty: {
        marginTop: 32,
        textAlign: "center",
        color: "#6B7280",
    },

    historyContainer: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
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
});
