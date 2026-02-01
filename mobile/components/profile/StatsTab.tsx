import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { userApi } from "../../constants/api";

interface UserStats {
    totalReviews: number;
    totalBooks: number;
    averageRating: number;
    ratingDistribution: number[];
    topAuthor?: string;
    topCategory?: string;
    readingProfile?: {
        favoriteGenres: string[];
        favoriteAuthors: string[];
        bookLengthPreference: string;
    };
    readingStats: {
        read: number;
        reading: number;
        wantToRead: number;
    };
    librarySize: number;
    challengeStats?: {
        active: number;
        completed: number;
    };
}

interface StatsTabProps {
    userId: string;
}

export function StatsTab({ userId }: StatsTabProps) {
    const { t } = useTranslation();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await userApi.getUserStats(userId);
                setStats(res.data);

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }).start();
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [userId, fadeAnim]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#3B82F6" size="large" />
            </View>
        );
    }

    if (!stats) return null;

    const totalRatings = stats.ratingDistribution.reduce((a, b) => a + b, 0);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Hero Card - Average Rating */}
            <LinearGradient
                colors={["#3B82F6", "#2563EB", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={styles.heroContent}>
                    <View style={styles.heroLeft}>
                        <Text style={styles.heroLabel}>Your Average Rating</Text>
                        <View style={styles.heroRatingRow}>
                            <Text style={styles.heroValue}>{stats.averageRating.toFixed(1)}</Text>
                            <Ionicons name="star" size={32} color="#FBBF24" style={{ marginLeft: 8 }} />
                        </View>
                        <Text style={styles.heroSubtext}>Based on {stats.totalReviews} reviews</Text>
                    </View>
                    <View style={styles.heroRight}>
                        <CircularProgress value={stats.averageRating} max={5} />
                    </View>
                </View>
            </LinearGradient>

            {/* Quick Stats Grid */}
            <View style={styles.quickStatsGrid}>
                <QuickStatCard
                    icon={<MaterialCommunityIcons name="book-open-page-variant" size={24} color="#38BDF8" />}
                    value={stats.totalBooks}
                    label="Books Read"
                    gradient={["rgba(56, 189, 248, 0.15)", "rgba(56, 189, 248, 0.05)"]}
                />
                <QuickStatCard
                    icon={<Ionicons name="create" size={24} color="#A78BFA" />}
                    value={stats.totalReviews}
                    label="Reviews"
                    gradient={["rgba(167, 139, 250, 0.15)", "rgba(167, 139, 250, 0.05)"]}
                />
            </View>

            {/* Reading Status Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reading Activity</Text>
                <View style={styles.quickStatsGrid}>
                    <QuickStatCard
                        icon={<MaterialCommunityIcons name="book-open-variant" size={24} color="#F59E0B" />}
                        value={stats.readingStats?.reading || 0}
                        label="Reading Now"
                        gradient={["rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0.05)"]}
                    />
                    <QuickStatCard
                        icon={<Ionicons name="bookmark" size={24} color="#10B981" />}
                        value={stats.readingStats?.wantToRead || 0}
                        label="Want to Read"
                        gradient={["rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.05)"]}
                    />
                    <QuickStatCard
                        icon={<Ionicons name="library" size={24} color="#6366F1" />}
                        value={stats.librarySize || 0}
                        label="Total Library"
                        gradient={["rgba(99, 102, 241, 0.15)", "rgba(99, 102, 241, 0.05)"]}
                    />
                </View>
            </View>

            {/* Rating Distribution - Visual Stars */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating Breakdown</Text>
                <View style={styles.ratingVisualContainer}>
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratingDistribution[rating - 1];
                        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                        return (
                            <View key={rating} style={styles.ratingVisualRow}>
                                <View style={styles.starsRow}>
                                    {[...Array(rating)].map((_, i) => (
                                        <Ionicons key={i} name="star" size={14} color="#FBBF24" />
                                    ))}
                                </View>
                                <View style={styles.barContainer}>
                                    <LinearGradient
                                        colors={["#3B82F6", "#2563EB"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.barFillGradient, { width: `${percentage}%` }]}
                                    />
                                </View>
                                <Text style={styles.ratingCount}>{count}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Library Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Library Insights</Text>
                <View style={styles.insightsGrid}>
                    <InsightCardEnhanced
                        icon={<Ionicons name="person" size={28} color="#38BDF8" />}
                        label="Top Author"
                        value={stats.topAuthor || "N/A"}
                        accentColor="#38BDF8"
                    />
                    <InsightCardEnhanced
                        icon={<Ionicons name="bookmark" size={28} color="#A78BFA" />}
                        label="Top Category"
                        value={stats.topCategory || "N/A"}
                        accentColor="#A78BFA"
                    />
                </View>
            </View>

            {/* Challenge Performance */}
            {stats.challengeStats && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('challenges.stats_title')}</Text>
                    <View style={styles.quickStatsGrid}>
                        <QuickStatCard
                            icon={<Ionicons name="trophy" size={24} color="#FBBF24" />}
                            value={stats.challengeStats.completed}
                            label={t('challenges.stats_completed')}
                            gradient={["rgba(251, 191, 36, 0.15)", "rgba(251, 191, 36, 0.05)"]}
                        />
                        <QuickStatCard
                            icon={<Ionicons name="flame" size={24} color="#EF4444" />}
                            value={stats.challengeStats.active}
                            label={t('challenges.stats_active')}
                            gradient={["rgba(239, 68, 68, 0.15)", "rgba(239, 68, 68, 0.05)"]}
                        />
                    </View>
                </View>
            )}

            {/* Reading Profile */}
            {stats.readingProfile && (stats.readingProfile.favoriteGenres.length > 0 || stats.readingProfile.favoriteAuthors.length > 0) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reading Profile</Text>
                    <View style={styles.profileContainer}>
                        {stats.readingProfile.favoriteGenres.length > 0 && (
                            <PreferenceItemEnhanced
                                icon={<Ionicons name="bookmarks" size={20} color="#10B981" />}
                                label="Favorite Genres"
                                values={stats.readingProfile.favoriteGenres}
                                color="#10B981"
                            />
                        )}
                        {stats.readingProfile.favoriteAuthors.length > 0 && (
                            <PreferenceItemEnhanced
                                icon={<Ionicons name="people" size={20} color="#F59E0B" />}
                                label="Favorite Authors"
                                values={stats.readingProfile.favoriteAuthors}
                                color="#F59E0B"
                            />
                        )}
                    </View>
                </View>
            )}
        </Animated.View>
    );
}

function CircularProgress({ value, max }: { value: number; max: number }) {
    const percentage = (value / max) * 100;

    return (
        <View style={styles.circularProgress}>
            <View style={styles.circularProgressInner}>
                <Text style={styles.circularProgressText}>{percentage.toFixed(0)}%</Text>
            </View>
        </View>
    );
}

function QuickStatCard({ icon, value, label, gradient }: { icon: any; value: any; label: string; gradient: string[] }) {
    return (
        <LinearGradient colors={gradient as [string, string]} style={styles.quickStatCard}>
            <View style={styles.quickStatIcon}>{icon}</View>
            <Text style={styles.quickStatValue}>{value}</Text>
            <Text style={styles.quickStatLabel}>{label}</Text>
        </LinearGradient>
    );
}

function InsightCardEnhanced({ icon, label, value, accentColor }: { icon: any; label: string; value: string; accentColor: string }) {
    return (
        <View style={styles.insightCardEnhanced}>
            <View style={[styles.insightIconContainer, { backgroundColor: `${accentColor}15` }]}>
                {icon}
            </View>
            <Text style={styles.insightLabel}>{label}</Text>
            <Text style={styles.insightValueEnhanced} numberOfLines={2}>{value}</Text>
        </View>
    );
}

function PreferenceItemEnhanced({ icon, label, values, color }: { icon: any; label: string; values: string[]; color: string }) {
    return (
        <View style={styles.preferenceItemEnhanced}>
            <View style={styles.preferenceHeaderEnhanced}>
                <View style={[styles.preferenceIconBadge, { backgroundColor: `${color}15` }]}>
                    {icon}
                </View>
                <Text style={styles.preferenceLabelEnhanced}>{label}</Text>
            </View>
            <View style={styles.tagContainerEnhanced}>
                {values.slice(0, 3).map((v, i) => (
                    <View key={i} style={[styles.tagEnhanced, { borderColor: `${color}40`, backgroundColor: `${color}10` }]}>
                        <Text style={[styles.tagTextEnhanced, { color }]}>{v}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    heroContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    heroLeft: {
        flex: 1,
    },
    heroLabel: {
        fontSize: 14,
        fontFamily: "Nunito-SemiBold",
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    heroRatingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    heroValue: {
        fontSize: 48,
        fontFamily: "Nunito-Black",
        color: "#FFFFFF",
    },
    heroSubtext: {
        fontSize: 13,
        fontFamily: "Nunito-Medium",
        color: "rgba(255, 255, 255, 0.7)",
    },
    heroRight: {
        marginLeft: 16,
    },
    circularProgress: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    circularProgressInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    circularProgressText: {
        fontSize: 18,
        fontFamily: "Nunito-Black",
        color: "#1E40AF",
    },
    quickStatsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    quickStatCard: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    quickStatIcon: {
        marginBottom: 12,
    },
    quickStatValue: {
        fontSize: 28,
        fontFamily: "Nunito-Black",
        color: "#F9FAFB",
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 12,
        fontFamily: "Nunito-SemiBold",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    ratingVisualContainer: {
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    ratingVisualRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    starsRow: {
        flexDirection: "row",
        width: 90,
        gap: 2,
    },
    barContainer: {
        flex: 1,
        height: 10,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 5,
        overflow: "hidden",
        marginHorizontal: 12,
    },
    barFillGradient: {
        height: "100%",
        borderRadius: 5,
    },
    ratingCount: {
        color: "#94A3B8",
        fontSize: 13,
        fontFamily: "Nunito-Bold",
        width: 30,
        textAlign: "right",
    },
    insightsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    insightCardEnhanced: {
        flex: 1,
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
        alignItems: "center",
    },
    insightIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    insightLabel: {
        fontSize: 12,
        fontFamily: "Nunito-SemiBold",
        color: "#94A3B8",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    insightValueEnhanced: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        textAlign: "center",
    },
    profileContainer: {
        gap: 16,
    },
    preferenceItemEnhanced: {
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    preferenceHeaderEnhanced: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    preferenceIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    preferenceLabelEnhanced: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
    },
    tagContainerEnhanced: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagEnhanced: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    tagTextEnhanced: {
        fontSize: 13,
        fontFamily: "Nunito-Bold",
    },
});
