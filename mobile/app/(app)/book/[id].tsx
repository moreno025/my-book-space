import React, { useState, useEffect, useRef, useContext } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// hooks
import { useBookReviews } from "../../../hooks/Book/useBookReviews";
import { useAppFonts } from "../../../hooks/useFonts";
import { useBookDetail } from "../../../hooks/Book/useBookDetail";
import { useCreateReview } from "../../../hooks/Review/useCreateReview";
import { useUpdateReview } from "../../../hooks/Review/useUpdateReview";
import { useRelatedBooks } from "../../../hooks/Book/useRelatedBooks";
import { AuthContext } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

// components
import { BookDetailSkeleton } from "../../../components/skeleton/BookDetailSkeleton";
import { SimilarBooksCarousel } from "@/components/book/SimilarBookCarousel";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { SaveBookModal } from "@/components/book/SaveBookModal";
import { CreateListModal } from "@/components/profile/CreateListModal";

// api
import { bookListApi } from "../../../constants/api/index";


const estimateReadingTime = (pages?: number | null) => {
    if (!pages) return "—";
    return `${Math.ceil(pages / 40)}h `;
};

export default function BookDetailScreen() {
    const { id, writeReview } = useLocalSearchParams<{ id: string; writeReview?: string }>();
    const fontsLoaded = useAppFonts();
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();

    const { book, loading } = useBookDetail(id);
    const { relatedBooks } = useRelatedBooks(book);
    const { reviews, loading: loadingReviews, refetch: refetchReviews } = useBookReviews(id);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // Auto-open review modal if coming from long-press "Write a Review"
    useEffect(() => {
        if (!loading && book && writeReview === "true") {
            setShowReviewModal(true);
        }
    }, [loading, book, writeReview]);

    const handleSaveSuccess = (listName: string) => {
        showToast(`Saved to ${listName}!`, "success");
    };

    const handleCreateListSubmit = async (data: { title: string; description: string; isPublic: boolean }) => {
        try {
            await bookListApi.createBookList(data);
            showToast("List created!", "success");
            setCreateModalVisible(false);
            // After creating, we might want to re-open the save modal to select it
            // but for simplicity we'll just stay here. 
            // Better yet, the user might expect it to save automatically to the new list,
            // but the current API create doesn't take books.
            setShowSaveModal(true);
        } catch (error) {
            console.error(error);
            showToast("Failed to create list.", "error");
        }
    };

    const [activeTab, setActiveTab] =
        useState<"Reviews" | "Readers" | "Lists">("Reviews");
    const fadeAnimTab = useRef(new Animated.Value(0)).current;

    const [expanded, setExpanded] = useState(false);

    const coverScale = useRef(new Animated.Value(0.92)).current;
    const coverOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslate = useRef(new Animated.Value(16)).current;
    const {
        createReview,
        loading: creatingReview,
    } = useCreateReview(id);

    // Find if user already reviewed
    const userReview = reviews.find(r => r.user?._id === user?.id);
    const { updateReview, loading: updatingReview } = useUpdateReview(userReview?._id || "");

    const isSubmitting = creatingReview || updatingReview;

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
    }, [loading, coverScale, coverOpacity, contentOpacity, contentTranslate]);

    useEffect(() => {
        fadeAnimTab.setValue(0);
        Animated.timing(fadeAnimTab, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [activeTab, fadeAnimTab]);

    if (!fontsLoaded) return null;

    if (loading || !book) {
        return (
            <SafeAreaView style={styles.safe}>
                <BookDetailSkeleton />
            </SafeAreaView>
        );
    }

    const readers = Array.from(
        new Map(reviews.filter((r) => r?.user?._id).map((r) => [r.user._id, r.user])).values()
    );


    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={["#0F172A", "#1E293B", "#0F172A"]}
                style={StyleSheet.absoluteFill}
            />

            {book.coverUrl && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
                        blurRadius={100}
                    />
                </View>
            )}

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
                            <BlurView intensity={20} tint="light" style={styles.backButtonBlur}>
                                <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                            </BlurView>
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
                                icon={<Ionicons name="star" size={18} color="#FBBF24" />}
                                value={book.rating ?? "—"}
                                label="Rating"
                            />
                            <Metric
                                icon={
                                    <MaterialCommunityIcons
                                        name="book-open-page-variant"
                                        size={18}
                                        color="#38BDF8"
                                    />
                                }
                                value={book.pages ?? "—"}
                                label="Pages"
                            />
                            <Metric
                                icon={<Ionicons name="time-outline" size={18} color="#38BDF8" />}
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

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.actionButtonSecondary}
                                onPress={() => setShowSaveModal(true)}
                            >
                                <Ionicons name="list-outline" size={20} color="#E5E7EB" />
                                <Text style={styles.actionTextSecondary}>Add to list</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setShowReviewModal(true)}
                            >
                                <Ionicons
                                    name={userReview ? "create" : "create-outline"}
                                    size={18}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.actionTextPrimary}>
                                    {userReview ? "Update review" : "Write a review"}
                                </Text>
                            </TouchableOpacity>

                            <ReviewModal
                                visible={showReviewModal}
                                onClose={() => setShowReviewModal(false)}
                                loading={isSubmitting}
                                initialRating={userReview?.rating}
                                initialReview={userReview?.review}
                                onSubmit={async ({ rating, review }) => {
                                    try {
                                        if (userReview) {
                                            await updateReview({ rating, review });
                                            showToast("Review updated!", "success");
                                        } else {
                                            const result = await createReview({ rating, review });
                                            if (!result) return;
                                            showToast("Review posted!", "success");
                                        }
                                        setShowReviewModal(false);
                                        refetchReviews();
                                    } catch (error) {
                                        console.error(error);
                                        showToast("Something went wrong. Try again later.", "error");
                                    }
                                }}
                            />
                        </View>

                        {/* TABS */}
                        <View style={styles.tabs}>
                            {(["Reviews", "Readers", "Lists"] as const).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[
                                        styles.tabButton,
                                        activeTab === tab && styles.tabActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === tab && styles.tabTextActive,
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
                                                    <View style={styles.reviewHeader}>
                                                        <Image
                                                            source={{
                                                                uri: r.user.avatar || "https://via.placeholder.com/40",
                                                            }}
                                                            style={styles.reviewAvatar}
                                                        />
                                                        <View style={styles.reviewUserInfo}>
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

                    <SimilarBooksCarousel currentBook={book} allBooks={relatedBooks} />
                    {/* <RelatedBookCarousel currentBook={book} /> */}
                </ScrollView>

                <SaveBookModal
                    visible={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    book={{
                        id: book.id,
                        title: book.title,
                        authors: book.authors,
                        coverUrl: book.coverUrl ?? undefined,
                        publishedDate: book.publishedYear?.toString()
                    }}
                    onSuccess={handleSaveSuccess}
                    onError={(msg) => showToast(msg, "error")}
                    onCreateList={() => setCreateModalVisible(true)}
                />

                <CreateListModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onSubmit={handleCreateListSubmit}
                />
            </SafeAreaView>
        </View>
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
            <View style={styles.statIconContainer}>
                {icon}
            </View>
            <View style={styles.statInfo}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: "#0F172A" },
    safe: { flex: 1, backgroundColor: "transparent" },
    coverContainer: { alignItems: "center", paddingTop: 40 },
    cover: {
        width: 180,
        height: 270,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
        borderWidth: 0.5,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    backButton: { position: "absolute", top: 10, left: 16, zIndex: 10 },
    backButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    content: { padding: 24 },
    title: { fontSize: 28, fontFamily: "Nunito-Black", color: "#F9FAFB", marginTop: 20, lineHeight: 34 },
    author: { fontSize: 18, fontFamily: "Nunito-Bold", color: "#38BDF8", marginTop: 8 },
    year: { fontSize: 14, color: "#9CA3AF", marginTop: 6, marginBottom: 14, fontFamily: "Nunito-Medium" },
    genres: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginBottom: 8 },
    genreChip: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    genreText: { color: "#F9FAFB", fontSize: 13, fontWeight: "700", fontFamily: "Nunito-Bold" },
    section: { marginTop: 32 },
    sectionTitle: { fontSize: 20, fontFamily: "Nunito-Bold", color: "#F9FAFB", marginBottom: 12 },
    description: { fontSize: 16, lineHeight: 24, color: "#94A3B8", marginBottom: 10, fontFamily: "Nunito-Medium" },
    readMore: { marginTop: 1, color: "#38BDF8", fontWeight: "700", marginBottom: 15, fontFamily: "Nunito-Bold" },
    stats: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    statInfo: { justifyContent: "center" },
    statValue: { color: "#F9FAFB", fontSize: 15, fontWeight: "700", fontFamily: "Nunito-Bold" },
    statLabel: { color: "#64748B", fontSize: 11, fontFamily: "Nunito-Medium", textTransform: "uppercase", letterSpacing: 0.5 },
    tabs: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: 12,
        padding: 4,
        marginTop: 32,
        marginBottom: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 10,
    },
    tabActive: { backgroundColor: "rgba(255, 255, 255, 0.08)" },
    tabText: { fontSize: 14, color: "#94A3B8", fontWeight: "700", fontFamily: "Nunito-Bold" },
    tabTextActive: { color: "#F9FAFB" },
    reviewCard: {
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    reviewUserInfo: { flex: 1 },
    reviewUser: { color: "#F9FAFB", fontWeight: "700", fontSize: 15, fontFamily: "Nunito-Bold", marginBottom: 4 },
    reviewRating: { flexDirection: "row", gap: 2 },
    reviewComment: { color: "#E5E7EB", fontSize: 14, lineHeight: 20, fontFamily: "Nunito-Medium", marginTop: 8 },
    readersContainer: { flexDirection: "row", flexWrap: "wrap" },
    readerCard: { alignItems: "center", marginRight: 12, marginBottom: 12 },
    readerAvatar: { width: 40, height: 40, borderRadius: 20 },
    readerName: { color: "#E5E7EB", fontSize: 12, marginTop: 4 },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    actionButtonSecondary: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    actionTextPrimary: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
        fontFamily: "Nunito-Bold",
    },
    actionTextSecondary: {
        fontSize: 15,
        fontWeight: "700",
        color: "#E5E7EB",
        fontFamily: "Nunito-Bold",
    },

});
