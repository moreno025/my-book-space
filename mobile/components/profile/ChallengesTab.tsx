import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ReadingChallenge } from "../../types/challenge";

interface ChallengesTabProps {
    challenges: ReadingChallenge[];
    loading: boolean;
    onCreatePress: () => void;
    onDeletePress: (id: string) => void;
}

export function ChallengesTab({ challenges, loading, onCreatePress, onDeletePress }: ChallengesTabProps) {
    const { t } = useTranslation();

    const renderChallenge = ({ item }: { item: ReadingChallenge }) => {
        const progress = Math.min(item.booksRead.length / item.goalBooks, 1);
        const daysLeft = Math.ceil((new Date(item.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        return (
            <View style={styles.challengeCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.challengeTitle}>{item.title}</Text>
                    <TouchableOpacity onPress={() => onDeletePress(item._id)}>
                        <Ionicons name="trash-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                        {t('challenges.books_progress', { current: item.booksRead.length, total: item.goalBooks })}
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        item.status === 'completed' ? styles.statusCompleted :
                            item.status === 'expired' ? styles.statusExpired : styles.statusActive
                    ]}>
                        <Text style={styles.statusText}>{t(`challenges.${item.status}`)}</Text>
                    </View>
                </View>

                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>

                <View style={styles.cardFooter}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.daysText}>
                        {daysLeft > 0 ? t('challenges.days_left', { count: daysLeft }) : t('challenges.expired')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.createButton} onPress={onCreatePress}>
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.createButtonText}>{t('challenges.create_title')}</Text>
            </TouchableOpacity>

            {challenges.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={60} color="#1E293B" />
                    <Text style={styles.emptyText}>{t('profile.no_challenges')}</Text>
                </View>
            ) : (
                <FlatList
                    data={challenges}
                    keyExtractor={(item) => item._id}
                    renderItem={renderChallenge}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 24,
        gap: 8,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontFamily: "Nunito-Bold",
        fontSize: 16,
    },
    challengeCard: {
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    challengeTitle: {
        fontSize: 18,
        fontFamily: "Nunito-Black",
        color: "#F1F5F9",
    },
    progressInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    progressText: {
        color: "#94A3B8",
        fontSize: 14,
        fontFamily: "Nunito-Bold",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusActive: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    statusCompleted: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
    },
    statusExpired: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Nunito-Black",
        color: "#3B82F6",
    },
    progressBarBg: {
        height: 8,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 16,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    daysText: {
        fontSize: 13,
        color: "#94A3B8",
        fontFamily: "Nunito-SemiBold",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 16,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 16,
        fontFamily: "Nunito-SemiBold",
    },
    listContent: {
        paddingBottom: 20,
    }
});
