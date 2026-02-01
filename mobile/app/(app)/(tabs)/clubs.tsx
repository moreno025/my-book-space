import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBookClubs } from "@/hooks/useBookClubs";
import { BookClub } from "@/types/bookClub";
import { getImageUrl } from "@/utils/images";

export default function ClubsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
    const { myClubs, discoverClubs, loading, fetchMyClubs, fetchDiscoverClubs } = useBookClubs();

    const onRefresh = () => {
        if (activeTab === 'my') {
            fetchMyClubs();
        } else {
            fetchDiscoverClubs();
        }
    };

    const renderClubCard = ({ item }: { item: BookClub }) => (
        <TouchableOpacity
            style={styles.clubCard}
            onPress={() => router.push({ pathname: '/club/[id]', params: { id: item._id } })}
        >
            <View style={styles.clubHeader}>
                <View style={styles.clubAvatar}>
                    {item.avatar ? (
                        <Image source={{ uri: getImageUrl(item.avatar) || undefined }} style={styles.clubAvatarImage} />
                    ) : (
                        <Ionicons name="people" size={24} color="#3B82F6" />
                    )}
                </View>
                <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{item.name}</Text>
                    <Text style={styles.clubMembers}>
                        {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
                    </Text>
                </View>
                {item.visibility === 'private' && (
                    <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                )}
            </View>
            {item.description && (
                <Text style={styles.clubDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}
            {item.currentBook && (
                <View style={styles.currentBook}>
                    <Ionicons name="book-outline" size={14} color="#3B82F6" />
                    <Text style={styles.currentBookText} numberOfLines={1}>
                        Reading: {item.currentBook.title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const data = activeTab === 'my' ? myClubs : discoverClubs;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Book Clubs</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/club/create')}
                >
                    <Ionicons name="add-circle" size={28} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my' && styles.activeTab]}
                    onPress={() => setActiveTab('my')}
                >
                    <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
                        My Clubs
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
                    onPress={() => setActiveTab('discover')}
                >
                    <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                        Discover
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={renderClubCard}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#3B82F6" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name={activeTab === 'my' ? "people-outline" : "compass-outline"}
                            size={64}
                            color="#4B5563"
                        />
                        <Text style={styles.emptyTitle}>
                            {activeTab === 'my' ? "No clubs yet" : "No clubs to discover"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'my'
                                ? "Create or join a book club to get started"
                                : "Check back later for new clubs"}
                        </Text>
                        {activeTab === 'my' && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/club/create')}
                            >
                                <Text style={styles.emptyButtonText}>Create Club</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    createButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#1F2937",
    },
    activeTab: {
        backgroundColor: "#3B82F6",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#9CA3AF",
        fontFamily: "Nunito-SemiBold",
    },
    activeTabText: {
        color: "#F9FAFB",
    },
    listContent: {
        flexGrow: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    clubCard: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#374151",
    },
    clubHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    clubAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        overflow: "hidden",
    },
    clubAvatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    clubInfo: {
        flex: 1,
    },
    clubName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
        marginBottom: 2,
    },
    clubMembers: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    clubDescription: {
        fontSize: 14,
        color: "#D1D5DB",
        fontFamily: "Nunito-Regular",
        marginBottom: 8,
        lineHeight: 20,
    },
    currentBook: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#374151",
    },
    currentBookText: {
        fontSize: 13,
        color: "#3B82F6",
        fontFamily: "Nunito-SemiBold",
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        marginTop: 16,
        fontFamily: "Nunito-Bold",
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
        fontFamily: "Nunito-Regular",
    },
    emptyButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
});
