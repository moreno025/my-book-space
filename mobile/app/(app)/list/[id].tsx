import React, { useContext, useState, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useListDetail } from "../../../hooks/BookList/useListDetail";
import { useAppFonts } from "../../../hooks/useFonts";
import { BookGrid } from "../../../components/book/BookGrid";
import { getImageUrl } from "@/utils/url";
import { bookListApi } from "../../../constants/api";
import { useToast } from "../../../context/ToastContext";
import { AuthContext } from "../../../context/AuthContext";
import { ListDetailHeader } from "../../../components/list/ListDetailHeader";

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { list, loading, error, refetch } = useListDetail(id);
    const fontsLoaded = useAppFonts();
    const { showToast } = useToast();
    const { user } = useContext(AuthContext);
    const [isSaving, setIsSaving] = useState(false);

    const isOwnList = !!(list?.user?._id && list.user._id === user?.id);
    const isAlreadySaved = !!(list?.savedBy && list.savedBy.includes(user?.id || ""));

    const handleSaveList = useCallback(async () => {
        if (!list) return;
        try {
            setIsSaving(true);

            if (isAlreadySaved) {
                // Unsave the list
                await bookListApi.unsaveList(list._id);
                showToast("List removed from your profile", "error");
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

    const mappedBooks = useMemo(() => {
        if (!list) return [];
        return list.books.map(b => ({
            id: b.googleBookId,
            coverUrl: b.thumbnail,
        }));
    }, [list]);

    const avatarUrl = useMemo(() => {
        if (!list?.user?.avatar) return null;
        return getImageUrl(list.user.avatar);
    }, [list?.user?.avatar]);

    const ListHeader = useCallback(() => {
        if (!list) return null;
        return (
            <ListDetailHeader
                list={list}
                avatarUrl={avatarUrl}
                isOwnList={isOwnList}
                isAlreadySaved={isAlreadySaved}
                isSaving={isSaving}
                onSave={handleSaveList}
                onBack={() => router.back()}
            />
        );
    }, [list, avatarUrl, isOwnList, isAlreadySaved, isSaving, handleSaveList, router]);

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

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0F172A", "#1E293B"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe} edges={["top"]}>

                {list.books.length > 0 ? (
                    <BookGrid
                        books={mappedBooks}
                        onBookPress={(bookId) => router.push({ pathname: "/book/[id]", params: { id: bookId } })}
                        ListHeaderComponent={ListHeader}
                        contentContainerStyle={styles.gridContent}
                    />
                ) : (
                    <View style={{ flex: 1 }}>
                        <ListHeader />
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={48} color="#4B5563" />
                            <Text style={styles.emptyText}>This list is currently empty.</Text>
                        </View>
                    </View>
                )}
            </SafeAreaView>
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
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
    },
    gridContent: {
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        opacity: 0.5,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontFamily: "Nunito-Medium",
        marginTop: 12,
    },
});
