import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Image, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { bookClubApi } from "@/constants/api/bookClub";
import { getImageUrl } from "@/utils/images";
import { BookClub } from "@/types/bookClub";
import { useClubMessages } from "@/hooks/useClubMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ClubSettingsModal from "@/components/ClubSettingsModal";

type TabType = 'chat' | 'members' | 'books';

export default function ClubDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [club, setClub] = useState<BookClub | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [settingsVisible, setSettingsVisible] = useState(false);

    const fetchClubDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await bookClubApi.getClubById(id);
            setClub(data.club);
            setIsMember(data.isMember);
            setIsAdmin(data.isAdmin);
        } catch (error) {
            console.error("Error fetching club:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchClubDetails();
    }, [fetchClubDetails]);

    const handleJoinLeave = async () => {
        try {
            if (isMember) {
                await bookClubApi.leaveClub(id);
                setIsMember(false);
            } else {
                await bookClubApi.joinClub(id);
                setIsMember(true);
            }
            await fetchClubDetails();
        } catch (error) {
            console.error("Error joining/leaving club:", error);
        }
    };

    const [showInfo, setShowInfo] = useState(!isMember);

    // Update showInfo when membership changes (collapse if joined, expand if left)
    useEffect(() => {
        setShowInfo(!isMember);
    }, [isMember]);

    const toggleInfo = () => {
        // Use LayoutAnimation for smooth transition if enabled in future
        setShowInfo(!showInfo);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (!club) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorText}>Club not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerTitleContainer} onPress={toggleInfo} activeOpacity={0.7}>
                    {!showInfo && (
                        <View style={styles.headerAvatarContainer}>
                            {club.avatar ? (
                                <Image source={{ uri: getImageUrl(club.avatar) || undefined }} style={styles.headerAvatar} />
                            ) : (
                                <Ionicons name="people" size={16} color="#3B82F6" />
                            )}
                        </View>
                    )}
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {club.name}
                    </Text>
                    <Ionicons name={showInfo ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                {isMember ? (
                    <TouchableOpacity style={styles.headerButton} onPress={() => setSettingsVisible(true)}>
                        <Ionicons name="settings-outline" size={24} color="#F9FAFB" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerButton} />
                )}
            </View>

            {/* Collapsible Club Info */}
            {showInfo && (
                <View style={styles.clubInfo}>
                    <View style={styles.clubAvatar}>
                        {club.avatar ? (
                            <Image source={{ uri: getImageUrl(club.avatar) || undefined }} style={styles.clubAvatarImage} />
                        ) : (
                            <Ionicons name="people" size={32} color="#3B82F6" />
                        )}
                    </View>
                    <Text style={styles.clubName}>{club.name}</Text>
                    {club.description && (
                        <Text style={styles.clubDescription}>{club.description}</Text>
                    )}
                    <View style={styles.clubMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={16} color="#9CA3AF" />
                            <Text style={styles.metaText}>
                                {club.members.length} {club.members.length === 1 ? 'member' : 'members'}
                            </Text>
                        </View>
                        {club.visibility === 'private' && (
                            <View style={styles.metaItem}>
                                <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                                <Text style={styles.metaText}>Private</Text>
                            </View>
                        )}
                    </View>

                    {/* Join/Leave Button */}
                    {!isAdmin && (
                        <TouchableOpacity
                            style={[styles.actionButton, isMember && styles.actionButtonSecondary]}
                            onPress={handleJoinLeave}
                        >
                            <Ionicons
                                name={isMember ? "exit-outline" : "enter-outline"}
                                size={20}
                                color={isMember ? "#EF4444" : "#F9FAFB"}
                            />
                            <Text style={[styles.actionButtonText, isMember && styles.actionButtonTextSecondary]}>
                                {isMember ? "Leave Club" : "Join Club"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Tabs */}
            {isMember && (
                <>
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
                            onPress={() => setActiveTab('chat')}
                        >
                            <Ionicons
                                name="chatbubbles-outline"
                                size={20}
                                color={activeTab === 'chat' ? "#3B82F6" : "#9CA3AF"}
                            />
                            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
                                Chat
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'members' && styles.tabActive]}
                            onPress={() => setActiveTab('members')}
                        >
                            <Ionicons
                                name="people-outline"
                                size={20}
                                color={activeTab === 'members' ? "#3B82F6" : "#9CA3AF"}
                            />
                            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
                                Members
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'books' && styles.tabActive]}
                            onPress={() => setActiveTab('books')}
                        >
                            <Ionicons
                                name="book-outline"
                                size={20}
                                color={activeTab === 'books' ? "#3B82F6" : "#9CA3AF"}
                            />
                            <Text style={[styles.tabText, activeTab === 'books' && styles.tabTextActive]}>
                                Books
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    {activeTab === 'chat' ? (
                        <ChatTab clubId={id} />
                    ) : (
                        <ScrollView style={styles.tabContent}>

                            {activeTab === 'members' && (
                                <View style={styles.membersList}>
                                    {club.members.map((member) => (
                                        <View key={member._id} style={styles.memberCard}>
                                            <View style={styles.memberAvatar}>
                                                <Ionicons name="person" size={20} color="#3B82F6" />
                                            </View>
                                            <View style={styles.memberInfo}>
                                                <Text style={styles.memberName}>{member.username}</Text>
                                                {club.admin._id === member._id && (
                                                    <View style={styles.adminBadge}>
                                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {activeTab === 'books' && (
                                <View style={styles.booksContent}>
                                    {club.currentBook ? (
                                        <View style={styles.currentBookCard}>
                                            <Text style={styles.sectionTitle}>Currently Reading</Text>
                                            <Text style={styles.bookTitle}>{club.currentBook.title}</Text>
                                            <Text style={styles.bookAuthors}>
                                                by {club.currentBook.authors.join(', ')}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="book-outline" size={64} color="#4B5563" />
                                            <Text style={styles.emptyStateTitle}>No Current Book</Text>
                                            <Text style={styles.emptyStateText}>
                                                The admin hasn&apos;t set a discussion book yet
                                            </Text>
                                        </View>
                                    )}
                                    {club.pastBooks && club.pastBooks.length > 0 && (
                                        <View style={styles.pastBooksSection}>
                                            <Text style={styles.sectionTitle}>Reading History</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                                                {[...club.pastBooks].reverse().map((book, index) => (
                                                    <View key={index} style={styles.pastBookCard}>
                                                        <Image
                                                            source={{ uri: book.thumbnail?.replace("http:", "https:") || undefined }}
                                                            style={styles.pastBookCover}
                                                        />
                                                        <Text style={styles.pastBookTitle} numberOfLines={2}>
                                                            {book.title}
                                                        </Text>
                                                        <Text style={styles.pastBookDate}>
                                                            {new Date(book.archivedAt).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {club.sharedBooks.length > 0 && (
                                        <View style={styles.sharedBooksSection}>
                                            <Text style={styles.sectionTitle}>Shared Books</Text>
                                            {club.sharedBooks.map((book, index) => (
                                                <View key={index} style={styles.sharedBookCard}>
                                                    <Text style={styles.bookTitle}>{book.title}</Text>
                                                    <Text style={styles.bookAuthors}>
                                                        by {book.authors.join(', ')}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </>
            )}

            {!isMember && (
                <View style={styles.notMemberContainer}>
                    <Ionicons name="lock-closed-outline" size={64} color="#4B5563" />
                    <Text style={styles.notMemberTitle}>Join to See More</Text>
                    <Text style={styles.notMemberText}>
                        Join this club to access chat, view members, and see shared books
                    </Text>
                </View>
            )}

            {/* Settings Modal */}
            <ClubSettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                club={club}
                isAdmin={isAdmin}
                onUpdate={fetchClubDetails}
            />
        </SafeAreaView>
    );
}

// Chat Tab Component
function ChatTab({ clubId }: { clubId: string }) {
    const { messages, loading, hasMore, loadMore } = useClubMessages(clubId);
    const { sendMessage } = useSendMessage(clubId);
    const flatListRef = useRef<FlatList>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = async (content: string) => {
        await sendMessage(content);
    };

    if (loading && messages.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <ChatMessage message={item} />}
                        contentContainerStyle={styles.messagesList}
                        onEndReached={() => hasMore && loadMore()}
                        onEndReachedThreshold={0.1}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#4B5563" />
                                <Text style={styles.emptyStateTitle}>No messages yet</Text>
                                <Text style={styles.emptyStateText}>
                                    Be the first to start the conversation!
                                </Text>
                            </View>
                        }
                    />
                    <ChatInput onSend={handleSend} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: "#EF4444",
        marginTop: 16,
        fontFamily: "Nunito-SemiBold",
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
    headerButton: {
        padding: 4,
        width: 32,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
        flexShrink: 1,
    },
    clubInfo: {
        padding: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    clubAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        overflow: "hidden",
    },
    clubAvatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    clubName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
        marginBottom: 8,
        textAlign: "center",
    },
    clubDescription: {
        fontSize: 14,
        color: "#D1D5DB",
        fontFamily: "Nunito-Regular",
        textAlign: "center",
        marginBottom: 16,
    },
    clubMeta: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#3B82F6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionButtonSecondary: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
    actionButtonTextSecondary: {
        color: "#EF4444",
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#3B82F6",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
        fontFamily: "Nunito-SemiBold",
    },
    tabTextActive: {
        color: "#3B82F6",
    },
    tabContent: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        flexGrow: 1,
        paddingTop: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        paddingTop: 80,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        marginTop: 16,
        fontFamily: "Nunito-Bold",
    },
    emptyStateText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
        fontFamily: "Nunito-Regular",
    },
    membersList: {
        padding: 20,
        gap: 12,
    },
    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    memberInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
    adminBadge: {
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#3B82F6",
        fontFamily: "Nunito-SemiBold",
    },
    booksContent: {
        padding: 20,
    },
    currentBookCard: {
        backgroundColor: "#1F2937",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#F9FAFB",
        marginBottom: 12,
        fontFamily: "Nunito-Bold",
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
        marginBottom: 4,
    },
    bookAuthors: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    sharedBooksSection: {
        marginTop: 8,
    },
    sharedBookCard: {
        backgroundColor: "#1F2937",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    notMemberContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    notMemberTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        marginTop: 16,
        fontFamily: "Nunito-Bold",
    },
    notMemberText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
        fontFamily: "Nunito-Regular",
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
    },
    headerAvatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    pastBooksSection: {
        marginTop: 24,
    },
    pastBookCard: {
        width: 100,
        marginRight: 12,
    },
    pastBookCover: {
        width: 100,
        height: 150,
        borderRadius: 8,
        backgroundColor: "#374151",
        marginBottom: 8,
    },
    pastBookTitle: {
        fontSize: 12,
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
        marginBottom: 4,
    },
    pastBookDate: {
        fontSize: 10,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
});
