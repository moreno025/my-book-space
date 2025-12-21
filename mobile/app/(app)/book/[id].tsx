import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAppFonts } from "../../../hooks/useFonts";
import { useBookDetail } from "../../../hooks/Book/useBookDetail";
import { BookDetailSkeleton } from "../../../components/skeleton/BookDetailSkeleton";
import { SimilarBooksCarousel } from "@/components/book/SimilarBookCarousel";

import { useBookReviews } from "../../../hooks/Book/useBookReviews";

const estimateReadingTime = (pages?: number | null) => {
    if (!pages) return "—";
    return `${Math.ceil(pages / 40)}h read`;
};

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const fontsLoaded = useAppFonts();
    const router = useRouter();

    const { book, loading } = useBookDetail(id);
    const { reviews, loading: loadingReviews } = useBookReviews(id);

    const [activeTab, setActiveTab] =
        useState<"Reviews" | "Readers" | "Lists">("Reviews");
    const fadeAnimTab = useRef(new Animated.Value(0)).current;

    const [expanded, setExpanded] = useState(false);

    const coverScale = useRef(new Animated.Value(0.92)).current;
    const coverOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslate = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(coverScale, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(coverOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslate, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading]);

    useEffect(() => {
        fadeAnimTab.setValue(0);
        Animated.timing(fadeAnimTab, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [activeTab]);

    if (!fontsLoaded) return null;

    if (loading || !book) {
        return (
            <SafeAreaView style={styles.safe}>
                <BookDetailSkeleton />
            </SafeAreaView>
        );
    }

    // Extract unique readers from reviews
    const readers = Array.from(
        new Map(reviews.filter((r) => r?.user?._id).map((r) => [r.user._id, r.user])).values()
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
                {/* COVER */}
                <View style={styles.coverContainer}>
                    {book.coverUrl && (
                        <Animated.Image
                            source={{ uri: book.coverUrl }}
                            style={[
                                styles.cover,
                                { opacity: coverOpacity, transform: [{ scale: coverScale }] },
                            ]}
                        />
                    )}

                    {/* BACK BUTTON */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>

                {/* CONTENT */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslate }],
                        },
                    ]}
                >
                    <Text style={styles.title}>{book.title}</Text>

                    {!!book.authors.length && (
                        <Text style={styles.author}>{book.authors.join(", ")}</Text>
                    )}

                    {book.publishedYear && (
                        <Text style={styles.year}>{book.publishedYear}</Text>
                    )}

                    {/* GENRES */}
                    {Array.isArray(book.categories) && book.categories.length > 0 && (
                        <View style={styles.genres}>
                            {book.categories.map((cat, index) => (
                                <View key={`${cat}-${index}`} style={styles.genreChip}>
                                    <Text style={styles.genreText}>{String(cat)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* METRICS */}
                    <View style={styles.stats}>
                        <Metric
                            icon={<Ionicons name="star" size={20} color="#FBBF24" />}
                            value={book.rating ?? "—"}
                            label="Rating"
                        />
                        <Metric
                            icon={
                                <MaterialCommunityIcons
                                    name="book-open-page-variant"
                                    size={20}
                                    color="#1F3A5F"
                                />
                            }
                            value={book.pages ?? "—"}
                            label="Pages"
                        />
                        <Metric
                            icon={<Ionicons name="time-outline" size={20} color="#1F3A5F" />}
                            value={estimateReadingTime(book.pages)}
                            label="Reading"
                        />
                    </View>

                    {/* DESCRIPTION */}
                    {!!book.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Synopsis</Text>
                            <Text
                                style={styles.description}
                                numberOfLines={expanded ? undefined : 4}
                            >
                                {book.description.replace(/<[^>]+>/g, "")}
                            </Text>

                            {book.description.length > 180 && (
                                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                                    <Text style={styles.readMore}>
                                        {expanded ? "Show less" : "Read more"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* TABS */}
                    <View style={styles.tabs}>
                        {(["Reviews", "Readers", "Lists"] as const).map((tab) => (
                            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && styles.tabActive,
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Animated.View style={{ opacity: fadeAnimTab, marginTop: 12 }}>
                        {activeTab === "Reviews" && (
                            <>
                                {loadingReviews && <ActivityIndicator color="#FFFFFF" />}
                                {!loadingReviews &&
                                    (reviews.length ? (
                                        reviews.map((r) => (
                                            <View key={r._id} style={styles.reviewCard}>
                                                <Image
                                                    source={{
                                                        uri: r.user.avatar || "https://via.placeholder.com/40",
                                                    }}
                                                    style={styles.reviewAvatar}
                                                />
                                                <View style={styles.reviewContent}>
                                                    <Text style={styles.reviewUser}>{r.user.username}</Text>
                                                    <View style={styles.reviewRating}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Ionicons
                                                                key={i}
                                                                name={i < r.rating ? "star" : "star-outline"}
                                                                size={14}
                                                                color="#FBBF24"
                                                            />
                                                        ))}
                                                    </View>
                                                    <Text style={styles.reviewComment}>{r.review}</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={{ color: "#E5E7EB", marginTop: 10 }}>No reviews yet</Text>
                                    ))}
                            </>
                        )}

                        {activeTab === "Readers" && (
                            <>
                                {readers.length ? (
                                    <View style={styles.readersContainer}>
                                        {readers.map((u) => (
                                            <View key={u._id} style={styles.readerCard}>
                                                <Image
                                                    source={{ uri: u.avatar }}
                                                    style={styles.readerAvatar}
                                                />
                                                <Text style={styles.readerName}>{u.username}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={{ color: "#E5E7EB" }}>No readers yet</Text>
                                )}
                            </>
                        )}

                        {activeTab === "Lists" && (
                            <Text style={{ color: "#E5E7EB" }}>Lists tab placeholder</Text>
                        )}
                    </Animated.View>
                </Animated.View>

                <SimilarBooksCarousel />
            </ScrollView>
        </SafeAreaView>
    );
}

/* ================= COMPONENTS ================= */
interface MetricProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
}

function Metric({ icon, value, label }: MetricProps) {
    return (
        <View style={styles.statItem}>
            {icon}
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#7d88a3ff" },
    coverContainer: { alignItems: "center", paddingTop: 20 },
    cover: {
        width: 180,
        height: 270,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    backButton: { position: "absolute", top: 10, left: 10, padding: 6, borderRadius: 20, zIndex: 10 },
    content: { padding: 20 },
    title: { fontSize: 26, fontFamily: "Nunito-Bold", color: "#F9FAFB", marginTop: 16 },
    author: { fontSize: 18, fontFamily: "Nunito-Italic", color: "#E5E7EB", marginTop: 6 },
    year: { fontSize: 14, color: "#ffffffff", marginTop: 6, marginBottom: 14 },
    genres: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginBottom: 8 },
    genreChip: { backgroundColor: "#1F2933", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
    genreText: { color: "#E5E7EB", fontSize: 13, fontWeight: "600" },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 18, fontFamily: "Nunito-Bold", color: "#F9FAFB", marginBottom: 6 },
    description: { fontSize: 15, lineHeight: 22, color: "#D1D5DB", marginBottom: 10 },
    readMore: { marginTop: 1, color: "#38BDF8", fontWeight: "600", marginBottom: 15 },
    stats: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#ffffffff", borderRadius: 16, paddingVertical: 18, marginTop: 12, borderColor: "black", borderWidth: 4 },
    statItem: { alignItems: "center" },
    statValue: { color: "#212122ff", fontSize: 16, fontWeight: "700" },
    statLabel: { color: "#747474ff", fontSize: 13, marginTop: 2 },
    tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 24, borderBottomWidth: 1, borderBottomColor: "#4B5563", paddingBottom: 8 },
    tabText: { fontSize: 16, color: "#9CA3AF", fontWeight: "600" },
    tabActive: { color: "#F9FAFB", borderBottomWidth: 2, borderBottomColor: "#22C55E", paddingBottom: 4 },
    reviewCard: {
        flexDirection: "row",
        backgroundColor: "#1F2933",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: "flex-start",
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: "#374151",
    },
    reviewContent: { flex: 1 },
    reviewUser: { color: "#F9FAFB", fontWeight: "700", marginBottom: 2 },
    reviewRating: { flexDirection: "row", marginBottom: 4 },
    reviewComment: { color: "#D1D5DB", fontSize: 14 },
    readersContainer: { flexDirection: "row", flexWrap: "wrap" },
    readerCard: { alignItems: "center", marginRight: 12, marginBottom: 12 },
    readerAvatar: { width: 40, height: 40, borderRadius: 20 },
    readerName: { color: "#E5E7EB", fontSize: 12, marginTop: 4 },
});
