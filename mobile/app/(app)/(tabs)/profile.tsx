import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// hooks
import { useAuth } from "../../../hooks/useAuth";
import { useUserLists } from "../../../hooks/BookList/useUserList";
import { useReadingChallenges } from "../../../hooks/Book/useReadingChallenges";
import { useToast } from "../../../context/ToastContext";

// components
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BookListCarousel } from "@/components/profile/BookListCarousel";
import { CreateListModal } from "@/components/profile/CreateListModal";
import { AddBookToListModal } from "@/components/profile/AddBookToListModal";
import { RenameListModal } from "@/components/profile/RenameListModal";
import { bookListApi } from "../../../constants/api";
import { StatsTab } from "@/components/profile/StatsTab";
import { ChallengesTab } from "@/components/profile/ChallengesTab";
import { CreateChallengeModal } from "@/components/profile/CreateChallengeModal";
import { CollaboratorsModal } from "@/components/list/CollaboratorsModal";


export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, refreshUser } = useAuth();
    const { lists, loading, refetch } = useUserLists({
        username: user?.username ?? "",
        enabled: !!user?.username,
    });

    const { challenges, loading: loadingChallenges, fetchChallenges, createChallenge, deleteChallenge } = useReadingChallenges();

    const { showToast } = useToast();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [addBookModalVisible, setAddBookModalVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [createChallengeModalVisible, setCreateChallengeModalVisible] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [listToRename, setListToRename] = useState<{ id: string; title: string } | null>(null);
    const [collaboratorsModalVisible, setCollaboratorsModalVisible] = useState(false);
    const [selectedListForCollaborators, setSelectedListForCollaborators] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (user?.username) {
                refetch();
                fetchChallenges();
                refreshUser(user.username);
            }
        }, [user?.username, refetch, fetchChallenges, refreshUser])
    );



    const handleCreateList = () => {
        setCreateModalVisible(true);
    };

    const handleCreateListSubmit = async (data: { title: string; description: string; visibility: 'public' | 'private' }) => {
        try {
            await bookListApi.createBookList(data);
            refetch();
        } catch (error: any) {
            console.error("Failed to create list:", error);
            showToast("Failed to create list", "error");
        }
    };

    const handleOpenAddBook = (listId: string) => {
        setSelectedListId(listId);
        setAddBookModalVisible(true);
    };

    const handleRenameList = (id: string, title: string) => {
        setListToRename({ id, title });
        setRenameModalVisible(true);
    };

    const handleRenameSubmit = async (newTitle: string) => {
        if (listToRename) {
            try {
                await bookListApi.updateBookList(listToRename.id, { title: newTitle });
                setRenameModalVisible(false);
                setListToRename(null);
                refetch();
            } catch (error) {
                console.error("Failed to rename list:", error);
            }
        }
    };

    const handleToggleVisibility = async (listId: string, newVisibility: 'public' | 'private') => {
        try {
            await bookListApi.updateBookList(listId, { visibility: newVisibility });
            const visibilityLabel = newVisibility === 'public'
                ? (user?.isPrivate ? 'Followers Only' : 'Public')
                : 'Private';
            showToast(`List is now ${visibilityLabel.toLowerCase()}!`, "success");
            refetch();
        } catch (error) {
            console.error("Failed to update visibility:", error);
            showToast("Failed to update list visibility", "error");
        }
    };

    const handleUnsaveList = async (listId: string) => {
        try {
            await bookListApi.unsaveList(listId);
            showToast("List removed from your profile", "success");
            refetch();
        } catch (error) {
            console.error("Failed to unsave list:", error);
            showToast("Failed to remove list", "error");
        }
    };

    const [activeTab, setActiveTab] = useState<'lists' | 'stats' | 'challenges'>('lists');

    const handleOpenCollaborators = (listId: string) => {
        setSelectedListForCollaborators(listId);
        setCollaboratorsModalVisible(true);
    };

    const handleAddCollaborator = async (userId: string) => {
        if (!selectedListForCollaborators) return false;
        try {
            await bookListApi.addCollaborator(selectedListForCollaborators, userId);
            refetch(); // Refresh lists to update collaborators list in state
            return true;
        } catch (error) {
            console.error("Failed to add collaborator:", error);
            throw error;
        }
    };

    const handleRemoveCollaborator = async (userId: string) => {
        if (!selectedListForCollaborators) return false;
        try {
            await bookListApi.removeCollaborator(selectedListForCollaborators, userId);
            refetch();
            return true;
        } catch (error) {
            console.error("Failed to remove collaborator:", error);
            throw error;
        }
    };

    // Refresh challenges when switching to challenges tab
    useEffect(() => {
        if (activeTab === 'challenges' && user?.username) {
            fetchChallenges();
        }
    }, [activeTab, user?.username, fetchChallenges]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90, flexGrow: 1 }}>
                {/* Header */}
                <ProfileHeader
                    user={user}
                    onAddList={handleCreateList}
                    listsCount={lists.length}
                    onNotification={() => router.push('/notifications')}
                />

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'lists' && styles.activeTab]}
                        onPress={() => setActiveTab('lists')}
                    >
                        <Ionicons name="albums-outline" size={20} color={activeTab === 'lists' ? "#3B82F6" : "#64748B"} />
                        <Text style={[styles.tabText, activeTab === 'lists' && styles.activeTabText]}>{t('tabs.home')} {t('profile.lists', 'Lists')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
                        onPress={() => setActiveTab('stats')}
                    >
                        <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color={activeTab === 'stats' ? "#3B82F6" : "#64748B"} />
                        <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>{t('profile.reading_stats')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
                        onPress={() => setActiveTab('challenges')}
                    >
                        <Ionicons name="trophy-outline" size={20} color={activeTab === 'challenges' ? "#3B82F6" : "#64748B"} />
                        <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>{t('profile.challenges')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {activeTab === 'lists' ? (
                    <>
                        {loading ? (
                            <View style={styles.centerSection}>
                                <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} />
                            </View>
                        ) : lists.length === 0 ? (
                            <View style={styles.centerSection}>
                                <Text style={styles.empty}>
                                    {"You haven't created any lists yet."}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* My Lists */}
                                {lists.filter(l => (typeof l.user === 'string' ? l.user : l.user._id) === user?.id).map((list, index) => (
                                    <View key={list._id}>
                                        <BookListCarousel
                                            listId={list._id}
                                            title={list.title}
                                            visibility={list.visibility}
                                            ownerId={typeof list.user === 'string' ? list.user : list.user._id}
                                            books={list.books}
                                            onRename={handleRenameList}
                                            onToggleVisibility={handleToggleVisibility}
                                            onUnsave={handleUnsaveList}
                                            isOwnerPrivate={user?.isPrivate}
                                            onAddBook={() => handleOpenAddBook(list._id)}
                                            onManageCollaborators={handleOpenCollaborators}
                                            onRefresh={() => {
                                                refetch();
                                                fetchChallenges();
                                            }}
                                        />
                                    </View>
                                ))}

                                {/* Shared Lists */}
                                {lists.filter(l => (typeof l.user === 'string' ? l.user : l.user._id) !== user?.id).length > 0 && (
                                    <View style={styles.sectionHeaderContainer}>
                                        <Ionicons name="people" size={20} color="#3B82F6" />
                                        <Text style={styles.sectionTitle}>Shared with You</Text>
                                    </View>
                                )}
                                {lists.filter(l => (typeof l.user === 'string' ? l.user : l.user._id) !== user?.id).map(list => (
                                    <BookListCarousel
                                        key={list._id}
                                        listId={list._id}
                                        title={list.title}
                                        visibility={list.visibility}
                                        ownerId={typeof list.user === 'string' ? list.user : list.user._id}
                                        books={list.books}
                                        onRename={handleRenameList}
                                        onToggleVisibility={handleToggleVisibility}
                                        onUnsave={handleUnsaveList}
                                        isOwnerPrivate={user?.isPrivate}
                                        onAddBook={() => handleOpenAddBook(list._id)}
                                        onRefresh={() => {
                                            refetch();
                                            fetchChallenges();
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </>
                ) : activeTab === 'stats' ? (
                    <StatsTab userId={user?.id || ""} />
                ) : (
                    <ChallengesTab
                        challenges={challenges}
                        loading={loadingChallenges}
                        onCreatePress={() => setCreateChallengeModalVisible(true)}
                        onDeletePress={deleteChallenge}
                    />
                )}
            </ScrollView>

            <CreateListModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateListSubmit}
            />

            <AddBookToListModal
                visible={addBookModalVisible}
                listId={selectedListId}
                onClose={() => {
                    setAddBookModalVisible(false);
                    setSelectedListId(null);
                }}
                onBookAdded={() => {
                    refetch();
                }}
            />

            <RenameListModal
                visible={renameModalVisible}
                currentTitle={listToRename?.title || ""}
                onClose={() => {
                    setRenameModalVisible(false);
                    setListToRename(null);
                }}
                onSubmit={handleRenameSubmit}
            />

            <CreateChallengeModal
                visible={createChallengeModalVisible}
                onClose={() => setCreateChallengeModalVisible(false)}
                onSubmit={createChallenge}
            />

            <CollaboratorsModal
                visible={collaboratorsModalVisible}
                onClose={() => {
                    setCollaboratorsModalVisible(false);
                    setSelectedListForCollaborators(null);
                }}
                listId={selectedListForCollaborators || ""}
                currentCollaborators={lists.find(l => l._id === selectedListForCollaborators)?.collaborators || []}
                onAdd={handleAddCollaborator}
                onRemove={handleRemoveCollaborator}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0F19",
    },
    centerSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loading: {
        color: "#E5E7EB",
        padding: 20,
        fontFamily: "Nunito-Bold"
    },
    empty: {
        color: "#9CA3AF",
        padding: 20,
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    activeTab: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
    },
    tabText: {
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#64748B",
    },
    activeTabText: {
        color: "#3B82F6",
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: "Nunito-Bold",
        color: "#F1F5F9",
        marginHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    sectionHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 5,
        gap: 10,
    },
});
