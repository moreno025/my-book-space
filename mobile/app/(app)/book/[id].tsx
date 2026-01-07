import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { getImageUrl } from "@/utils/url";
import { BookList } from "../../../types/bookList";

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
    const { t } = useTranslation();
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
    const [discoveryLists, setDiscoveryLists] = useState<BookList[]>([]);
    const [loadingDiscovery, setLoadingDiscovery] = useState(false);

    useEffect(() => {
        if (!loading && book && writeReview === "true") {
            setShowReviewModal(true);
        }
    }, [loading, book, writeReview]);

    const fetchDiscovery = useCallback(async () => {
        if (!book?.id) return;
        setLoadingDiscovery(true);
        try {
            const res = await bookListApi.getListsByBookId(book.id);
            setDiscoveryLists(res.data.lists);
        } catch (err) {
            console.error("Discovery error:", err);
        } finally {
            setLoadingDiscovery(false);
        }
    }, [book?.id]);

    useEffect(() => {
        fetchDiscovery();
    }, [fetchDiscovery]);

    const handleSaveSuccess = (listName: string) => {
        showToast(t('common.saved_to', { list: listName }), "success");
        fetchDiscovery(); // Recharge discovery lists
    };

    const handleCreateListSubmit = async (data: { title: string; description: string; visibility: 'public' | 'private' }) => {
        try {
            await bookListApi.createBookList(data);
            showToast("List created!", "success");
            setCreateModalVisible(false);
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
    const [showMoreReviews, setShowMoreReviews] = useState(false);
    const [showMoreReaders, setShowMoreReaders] = useState(false);

    const coverScale = useRef(new Animated.Value(0.92)).current;
    const coverOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslate = useRef(new Animated.Value(16)).current;
    const {
        createReview,
        loading: creatingReview,
    } = useCreateReview(id);

    const userReview = reviews.find(r => r.user?._id === user?.id);
    const { updateReview, loading: updatingReview } = useUpdateReview(userReview?._id || "");

    const isSubmitting = creatingReview || updatingReview;

    const readers = useMemo(() => {
        const readersMap = new Map();

        reviews.forEach((r) => {
            if (r?.user?._id) readersMap.set(r.user._id, r.user);
        });

        discoveryLists.forEach((l) => {
            if (l?.user?._id) readersMap.set(l.user._id, l.user);
        });

        return Array.from(readersMap.values());
    }, [reviews, discoveryLists]);

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



    const calculateAverageRating = () => {
        if (reviews.length < 5) return null;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const displayRating = calculateAverageRating() || book.rating;
    const ratingSource = calculateAverageRating() ? "user" : "google";

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

                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <BlurView intensity={20} tint="light" style={styles.backButtonBlur}>
                                <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

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

                        {Array.isArray(book.categories) && book.categories.length > 0 && (
                            <View style={styles.genres}>
                                {book.categories.map((cat, index) => (
                                    <View key={`${cat}-${index}`} style={styles.genreChip}>
                                        <Text style={styles.genreText}>{String(cat)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.stats}>
                            <Metric
                                icon={<Ionicons name="star" size={18} color="#FBBF24" />}
                                value={displayRating ?? "—"}
                                label={ratingSource === "user" ? `${t('book.rating')} (${reviews.length})` : t('book.rating')}
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
                                label={t('book.pages')}
                            />
                            <Metric
                                icon={<Ionicons name="time-outline" size={18} color="#38BDF8" />}
                                value={estimateReadingTime(book.pages)}
                                label={t('book.reading')}
                            />
                        </View>

                        {!!book.description && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('book.synopsis')}</Text>
                                <Text
                                    style={styles.description}
                                    numberOfLines={expanded ? undefined : 4}
                                >
                                    {book.description.replace(/<[^>]+>/g, "")}
                                </Text>

                                {book.description.length > 180 && (
                                    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                                        <Text style={styles.readMore}>
                                            {expanded ? t('book.show_less') : t('book.read_more')}
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
                                <Text style={styles.actionTextSecondary}>{t('book.add_to_list')}</Text>
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
                                    {userReview ? t('book.update_review') : t('book.write_review')}
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
                                            const result = await createReview({ rating, review, authors: book.authors });
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
                                        {t(`book.tabs.${tab.toLowerCase()}`)}
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
                                            <>
                                                {(showMoreReviews ? reviews : reviews.slice(0, 5)).map((r) => (
                                                    <View key={r._id} style={styles.reviewCard}>
                                                        <View style={styles.reviewHeader}>
                                                            <Image
                                                                source={{
                                                                    uri: getImageUrl(r.user.avatar) || "https://via.placeholder.com/40",
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
                                                ))}
                                                {reviews.length > 5 && (
                                                    <TouchableOpacity
                                                        style={styles.showMoreButton}
                                                        onPress={() => setShowMoreReviews(!showMoreReviews)}
                                                    >
                                                        <Text style={styles.showMoreText}>
                                                            {showMoreReviews ? t('book.show_less') : `${t('book.show_more')} (${reviews.length - 5} ${t('common.more', 'more')})`}
                                                        </Text>
                                                        <Ionicons
                                                            name={showMoreReviews ? "chevron-up" : "chevron-down"}
                                                            size={18}
                                                            color="#38BDF8"
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        ) : (
                                            <Text style={{ color: "#E5E7EB", marginTop: 10 }}>{t('book.no_reviews')}</Text>
                                        ))}
                                </>
                            )}

                            {activeTab === "Readers" && (
                                <>
                                    {readers.length ? (
                                        <>
                                            <View style={styles.readersContainer}>
                                                {(showMoreReaders ? readers : readers.slice(0, 5)).map((u) => (
                                                    <TouchableOpacity
                                                        key={u._id}
                                                        style={styles.readerCard}
                                                        onPress={() => router.push(`/user/${u.username}`)}
                                                        disabled={user?.id === u._id}
                                                    >
                                                        <Image
                                                            source={{
                                                                uri: getImageUrl(u.avatar) || "https://via.placeholder.com/40"
                                                            }}
                                                            style={styles.readerAvatar}
                                                        />
                                                        <View style={styles.readerInfo}>
                                                            <Text style={styles.readerName}>{u.username}</Text>
                                                            <Text style={styles.readerLabel}>Reader</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            {readers.length > 5 && (
                                                <TouchableOpacity
                                                    style={styles.showMoreButton}
                                                    onPress={() => setShowMoreReaders(!showMoreReaders)}
                                                >
                                                    <Text style={styles.showMoreText}>
                                                        {showMoreReaders ? t('book.show_less') : `${t('book.show_more')} (${readers.length - 5} ${t('common.more', 'more')})`}
                                                    </Text>
                                                    <Ionicons
                                                        name={showMoreReaders ? "chevron-up" : "chevron-down"}
                                                        size={18}
                                                        color="#38BDF8"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    ) : (
                                        <Text style={{ color: "#94A3B8", marginTop: 10, fontFamily: "Nunito-Medium" }}>{t('book.no_readers')}</Text>
                                    )}
                                </>
                            )}

                            {activeTab === "Lists" && (
                                <>
                                    {loadingDiscovery ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : discoveryLists.length > 0 ? (
                                        <View style={styles.listsContainer}>
                                            {discoveryLists.map((l) => (
                                                <TouchableOpacity
                                                    key={l._id}
                                                    style={styles.discoveryListCard}
                                                    onPress={() => router.push({ pathname: "/list/[id]", params: { id: l._id, view: 'discovery' } })}
                                                >
                                                    <View style={styles.discoveryListInfo}>
                                                        <Text style={styles.discoveryListTitle}>{l.title}</Text>
                                                        <View style={styles.discoveryListMeta}>
                                                            <Text style={styles.discoveryListUser}>{t('book.by')} {l.user.username}</Text>
                                                            <Text style={styles.discoveryListBooks}>{t('book.books_count', { count: l.books.length })}</Text>
                                                        </View>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={{ color: "#94A3B8", fontFamily: "Nunito-Medium", marginTop: 10 }}>
                                            {t('book.no_lists')}
                                        </Text>
                                    )}
                                </>
                            )}
                        </Animated.View>
                    </Animated.View>

                    <SimilarBooksCarousel currentBook={book} allBooks={relatedBooks} />
                </ScrollView>

                <SaveBookModal
                    visible={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    book={{
                        id: book.id,
                        title: book.title,
                        authors: book.authors,
                        coverUrl: book.coverUrl ?? undefined,
                        publishedDate: book.publishedYear?.toString(),
                        categories: book.categories
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
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
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
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    reviewUserInfo: { flex: 1 },
    reviewUser: { color: "#F9FAFB", fontWeight: "700", fontSize: 14, fontFamily: "Nunito-Bold", marginBottom: 2 },
    reviewRating: { flexDirection: "row", gap: 2 },
    reviewComment: { color: "#E5E7EB", fontSize: 13, lineHeight: 18, fontFamily: "Nunito-Medium", marginTop: 4 },
    readersContainer: { gap: 12 },
    readerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    readerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    readerInfo: { flex: 1 },
    readerName: {
        color: "#F9FAFB",
        fontSize: 15,
        fontWeight: "700",
        fontFamily: "Nunito-Bold",
        marginBottom: 2,
    },
    readerLabel: {
        color: "#94A3B8",
        fontSize: 12,
        fontFamily: "Nunito-Medium",
    },
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
    showMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 12,
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(56, 189, 248, 0.3)",
        gap: 8,
    },
    showMoreText: {
        color: "#38BDF8",
        fontSize: 14,
        fontWeight: "700",
        fontFamily: "Nunito-Bold",
        paddingRight: 4,
    },
    listsContainer: {
        gap: 12,
    },
    discoveryListCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "space-between",
    },
    discoveryListInfo: {
        flex: 1,
    },
    discoveryListTitle: {
        color: "#F9FAFB",
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        marginBottom: 4,
    },
    discoveryListMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    discoveryListUser: {
        color: "#38BDF8",
        fontSize: 13,
        fontFamily: "Nunito-SemiBold",
    },
    discoveryListBooks: {
        color: "#94A3B8",
        fontSize: 13,
        fontFamily: "Nunito-Medium",
    },

});
