import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
}

interface StatsTabProps {
    userId: string;
}


export function StatsTab({ userId }: StatsTabProps) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await userApi.getUserStats(userId);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#3B82F6" size="large" />
            </View>
        );
    }

    if (!stats) return null;

    const maxDist = Math.max(...stats.ratingDistribution, 1);

    return (
        <View style={styles.container}>
            {/* Overview Cards */}
            <View style={styles.overviewRow}>
                <MetricCard
                    icon={<Ionicons name="book" size={20} color="#38BDF8" />}
                    value={stats.totalBooks}
                    label="Books Read"
                />
                <MetricCard
                    icon={<Ionicons name="star" size={20} color="#FBBF24" />}
                    value={stats.averageRating}
                    label="Avg Rating"
                />
                <MetricCard
                    icon={<Ionicons name="create" size={20} color="#A78BFA" />}
                    value={stats.totalReviews}
                    label="Reviews"
                />
            </View>

            {/* Rating Distribution */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating Distribution</Text>
                <View style={styles.chartContainer}>
                    {stats.ratingDistribution.map((count, i) => (
                        <View key={i} style={styles.distributionRow}>
                            <Text style={styles.starLabel}>{i + 1}</Text>
                            <Ionicons name="star" size={12} color="#FBBF24" style={{ marginRight: 8 }} />
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barFill,
                                        { width: `${(count / maxDist) * 100}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.countLabel}>{count}</Text>
                        </View>
                    )).reverse()}
                </View>
            </View>

            {/* Reading Preferences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Library Insights</Text>
                <View style={styles.profileGrid}>
                    <InsightCard
                        icon="person-outline"
                        label="Top Author"
                        value={stats.topAuthor || "N/A"}
                    />
                    <InsightCard
                        icon="bookmark-outline"
                        label="Top Category"
                        value={stats.topCategory || "N/A"}
                    />
                </View>
            </View>

            {stats.readingProfile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reading Profile</Text>
                    <View style={styles.profileGrid}>
                        <PreferenceItem
                            icon="bookmarks-outline"
                            label="Fav Genres"
                            values={stats.readingProfile.favoriteGenres}
                        />
                        <PreferenceItem
                            icon="people-outline"
                            label="Fav Authors"
                            values={stats.readingProfile.favoriteAuthors}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

function MetricCard({ icon, value, label }: { icon: any, value: any, label: string }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardIcon}>{icon}</View>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardLabel}>{label}</Text>
        </View>
    );
}

function PreferenceItem({ icon, label, values }: { icon: any, label: string, values: string[] }) {
    if (!values || values.length === 0) return null;
    return (
        <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
                <Ionicons name={icon} size={18} color="#94A3B8" />
                <Text style={styles.preferenceLabel}>{label}</Text>
            </View>
            <View style={styles.tagContainer}>
                {values.slice(0, 3).map((v, i) => (
                    <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{v}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function InsightCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
                <Ionicons name={icon} size={18} color="#94A3B8" />
                <Text style={styles.preferenceLabel}>{label}</Text>
            </View>
            <Text style={styles.insightValue} numberOfLines={2}>{value}</Text>
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
    overviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    cardIcon: {
        marginBottom: 8,
        opacity: 0.8,
    },
    cardValue: {
        fontSize: 20,
        fontFamily: "Nunito-Black",
        color: "#F9FAFB",
    },
    cardLabel: {
        fontSize: 12,
        fontFamily: "Nunito-Medium",
        color: "#94A3B8",
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        marginBottom: 16,
    },
    chartContainer: {
        backgroundColor: "rgba(30, 41, 59, 0.3)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    distributionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    starLabel: {
        color: "#94A3B8",
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        width: 14,
        marginRight: 4,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 4,
        overflow: "hidden",
        marginRight: 12,
    },
    barFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 4,
    },
    countLabel: {
        color: "#94A3B8",
        fontSize: 12,
        fontFamily: "Nunito-Medium",
        width: 20,
        textAlign: "right",
    },
    profileGrid: {
        flexDirection: "row",
        gap: 12,
    },
    preferenceCard: {
        flex: 1,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    preferenceHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    preferenceLabel: {
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#94A3B8",
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    tag: {
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(56, 189, 248, 0.2)",
    },
    tagText: {
        color: "#38BDF8",
        fontSize: 11,
        fontFamily: "Nunito-Bold",
    },
    insightValue: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        marginTop: 4,
    },
});
