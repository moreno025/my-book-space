import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../../hooks/useAuth";
import { useBookSearch } from "../../../hooks/Search/useBookSearch";
import { useUserSearch } from "../../../hooks/Search/useUserSearch";
import { useUserSearchHistory } from "../../../hooks/Search/useUserSearchHistory";
import { useSearchHistory } from "../../../hooks/Search/useSearchHistory";

import { BookGrid } from "../../../components/book/BookGrid";
import { BookGridSkeleton } from "../../../components/skeleton/BookGridSkeleton";
import { useAppFonts } from "../../../hooks/useFonts";
import { getImageUrl } from "@/utils/url";
import { jpg } from "../../../assets/images";
import BarcodeScanner from "../../../components/search/BarcodeScanner";

type SearchTab = "books" | "users";

export default function SearchScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const fontsLoaded = useAppFonts();

    const { token } = useAuth();

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<SearchTab>("books");
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const { tab } = useLocalSearchParams<{ tab?: string }>();

    React.useEffect(() => {
        if (tab === "users") {
            setActiveTab("users");
        }
    }, [tab]);

    const { books, loading: booksLoading, hasSearched: booksSearched } = useBookSearch(query);
    const { users, loading: usersLoading, hasSearched: usersSearched } = useUserSearch(query);
    const { history, save, remove, clear } = useSearchHistory(token);
    const { history: userHistory, save: saveUser, remove: removeUser, clear: clearUser } = useUserSearchHistory(token);

    const handleBookPress = async (id: string) => {
        await save(query);
        router.push({ pathname: "/book/[id]", params: { id } });
    };

    const handleUserPress = async (user: { username: string; id?: string; _id?: string }) => {
        const userId = user.id || user._id;
        if (userId) {
            await saveUser(userId);
        }
        router.push({ pathname: "/(app)/(tabs)/user/[username]", params: { username: user.username } });
    };

    if (!fontsLoaded) return null;

    const loading = activeTab === "books" ? booksLoading : usersLoading;
    const hasSearched = activeTab === "books" ? booksSearched : usersSearched;

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
                        placeholder={t('search.placeholder', { tab: t(`search.${activeTab}`).toLowerCase() })}
                        placeholderTextColor="#9CA3AF"
                        style={styles.headerInput}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />

                    {query.length > 0 ? (
                        <TouchableOpacity
                            style={styles.clearButtonContainer}
                            onPress={() => setQuery("")}
                        >
                            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.clearButtonContainer}
                            onPress={() => setIsScannerVisible(true)}
                        >
                            <Ionicons name="camera" size={26} color="#3B82F6" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* TAB SWITCHER */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "books" && styles.activeTab]}
                    onPress={() => setActiveTab("books")}
                >
                    <Ionicons
                        name="book"
                        size={18}
                        color={activeTab === "books" ? "#3B82F6" : "#6B7280"}
                    />
                    <Text style={[styles.tabText, activeTab === "books" && styles.activeTabText]}>
                        {t('search.books')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "users" && styles.activeTab]}
                    onPress={() => setActiveTab("users")}
                >
                    <Ionicons
                        name="people"
                        size={18}
                        color={activeTab === "users" ? "#3B82F6" : "#6B7280"}
                    />
                    <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
                        {t('search.users')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* SCAN CTA (Prominent button to open camera) */}
            {activeTab === "books" && query.length === 0 && (
                <View style={styles.scanCtaContainer}>
                    <TouchableOpacity
                        style={styles.scanCtaContent}
                        onPress={() => setIsScannerVisible(true)}
                    >
                        <View style={styles.scanIconWrapper}>
                            <Ionicons name="camera" size={32} color="#3B82F6" />
                        </View>
                        <View style={styles.scanTextWrapper}>
                            <Text style={styles.scanCtaTitle}>{t('search.scan_barcode')}</Text>
                            <Text style={styles.scanCtaSubtitle}>{t('search.empty_subtitle')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            )}

            {/* SEARCH HISTORY (only for books) */}
            {activeTab === "books" && query.length === 0 && history.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>{t('search.recent_searches')}</Text>

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

            {/* SEARCH HISTORY (only for users) */}
            {activeTab === "users" && query.length === 0 && userHistory.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>{t('search.recent_users')}</Text>

                        <TouchableOpacity onPress={clearUser}>
                            <Ionicons name="trash-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {userHistory.map((item) => (
                        <View key={item._id} style={styles.historyRow}>
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                onPress={() => handleUserPress({ username: item.searchedUser.username, id: item.searchedUser._id })}
                            >
                                <Image
                                    source={item.searchedUser.avatar ? { uri: getImageUrl(item.searchedUser.avatar) as string } : jpg.avatar}
                                    style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12, backgroundColor: "#E5E7EB" }}
                                />
                                <View>
                                    <Text style={styles.historyText}>{item.searchedUser.username}</Text>
                                    {item.searchedUser.name && (
                                        <Text style={{ fontSize: 12, fontFamily: "Nunito-Regular", color: "#6B7280" }}>
                                            {t('common.reader')}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => removeUser(item.searchedUser._id)}>
                                <Ionicons name="close-outline" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* RESULTS */}
            {loading && activeTab === "books" && <BookGridSkeleton />}

            {loading && activeTab === "users" && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{t('search.searching_users')}</Text>
                </View>
            )}

            {!loading && activeTab === "books" && books.length > 0 && (
                <BookGrid
                    books={books}
                    onBookPress={handleBookPress}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                />
            )}

            {!loading && activeTab === "users" && users.length > 0 && (
                <FlatList
                    data={users}
                    keyExtractor={(user) => user.id || user.username}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.userItem}
                            onPress={() => handleUserPress(item)}
                        >
                            <Image
                                source={item.avatar ? { uri: getImageUrl(item.avatar) as string } : jpg.avatar}
                                style={styles.userAvatar}
                            />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>@{item.username}</Text>
                                {item.name && (
                                    <Text style={styles.userFullName}>{t('common.reader')}</Text>
                                )}
                            </View>
                            {item.isPrivate && (
                                <Ionicons name="lock-closed" size={16} color="#6B7280" />
                            )}
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                />
            )}

            {!loading && hasSearched && activeTab === "books" && books.length === 0 && query.length > 1 && (
                <Text style={styles.empty}>{t('search.no_books_found')}</Text>
            )}

            {!loading && hasSearched && activeTab === "users" && users.length === 0 && query.length > 1 && (
                <Text style={styles.empty}>{t('search.no_users_found')}</Text>
            )}

            <BarcodeScanner
                isVisible={isScannerVisible}
                onClose={() => setIsScannerVisible(false)}
            />
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

    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 6,
    },
    activeTab: {
        backgroundColor: "#EFF6FF",
        borderColor: "#3B82F6",
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Nunito-SemiBold",
        color: "#6B7280",
    },
    activeTabText: {
        color: "#3B82F6",
    },

    empty: {
        marginTop: 32,
        textAlign: "center",
        color: "#6B7280",
        fontFamily: "Nunito-Medium",
    },

    loadingContainer: {
        marginTop: 32,
        alignItems: "center",
    },
    loadingText: {
        color: "#6B7280",
        fontFamily: "Nunito-Medium",
    },

    historyContainer: {
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 14,
        fontFamily: "Nunito-SemiBold",
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
        fontFamily: "Nunito-Regular",
    },

    userItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: "#E5E7EB",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#111827",
        marginBottom: 2,
    },
    userFullName: {
        fontSize: 14,
        fontFamily: "Nunito-Regular",
        color: "#6B7280",
    },

    // SCAN CTA STYLES
    scanCtaContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    scanCtaContent: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    scanIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    scanTextWrapper: {
        flex: 1,
    },
    scanCtaTitle: {
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        color: "#111827",
        marginBottom: 2,
    },
    scanCtaSubtitle: {
        fontSize: 14,
        fontFamily: "Nunito-Medium",
        color: "#6B7280",
    },
});
