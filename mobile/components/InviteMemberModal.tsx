import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useUserSearch } from "@/hooks/Search/useUserSearch";
import { bookClubApi } from "@/constants/api/bookClub";
import { userApi } from "@/constants/api";
import { getImageUrl } from "@/utils/images";
import { User } from "@/types/user";

interface InviteMemberModalProps {
    visible: boolean;
    onClose: () => void;
    clubId: string;
    currentMembers: string[]; // List of member IDs to filter/indicate status
    onInviteSuccess: () => void;
}

export default function InviteMemberModal({
    visible,
    onClose,
    clubId,
    currentMembers,
    onInviteSuccess,
}: InviteMemberModalProps) {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const { users: searchResults, loading } = useUserSearch(query);
    const [following, setFollowing] = useState<User[]>([]);
    const [inviting, setInviting] = useState<string | null>(null);

    // Fetch following when modal opens
    useEffect(() => {
        if (visible && user?._id) {
            console.log("[InviteMemberModal] Fetching following for user:", user._id);
            userApi.getFollowing(user._id)
                .then(res => {
                    console.log("[InviteMemberModal] Following response count:", res.data.followings?.length);
                    if (res.data.followings) {
                        setFollowing(res.data.followings);
                        console.log("[InviteMemberModal] Following usernames:", res.data.followings.map((u: any) => u.username));
                    }
                })
                .catch(err => console.log("[InviteMemberModal] Error fetching following:", err));
        }
    }, [visible, user]);

    const handleInvite = async (userId: string) => {
        try {
            setInviting(userId);
            await bookClubApi.inviteUser(clubId, userId);
            Alert.alert("Success", "User invited successfully");
            onInviteSuccess();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to invite user");
        } finally {
            setInviting(null);
        }
    };

    const isMember = (userId: string) => currentMembers.some(id => String(id) === String(userId));

    // Filter following to exclude those who are already members
    const suggestedUsers = following.filter(f => !isMember(f._id));

    // Determine what list to show
    const dataToShow = query.length > 0 ? searchResults : suggestedUsers;
    const showSuggestionsTitle = query.length === 0 && dataToShow.length > 0;

    const renderUserItem = ({ item }: { item: User }) => {
        const alreadyMember = isMember(item._id);

        return (
            <View style={styles.userItem}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        {item.avatar ? (
                            <Image
                                source={{ uri: getImageUrl(item.avatar) || undefined }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Ionicons name="person-circle-outline" size={40} color="#9CA3AF" />
                        )}
                    </View>
                    <View>
                        <Text style={styles.username}>{item.username}</Text>
                        {item.name ? <Text style={styles.name}>{item.name}</Text> : null}
                    </View>
                </View>

                {alreadyMember ? (
                    <View style={styles.memberBadge}>
                        <Text style={styles.memberBadgeText}>Member</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => handleInvite(item._id)}
                        disabled={inviting === item._id}
                    >
                        {inviting === item._id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.inviteButtonText}>Invite</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Invite Members</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            placeholderTextColor="#6B7280"
                            value={query}
                            onChangeText={setQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <FlatList
                        data={dataToShow}
                        keyExtractor={(item) => item._id}
                        renderItem={renderUserItem}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            showSuggestionsTitle ? (
                                <Text style={styles.sectionTitle}>People You Follow</Text>
                            ) : null
                        }
                        ListEmptyComponent={
                            query.length > 0 && !loading ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No users found</Text>
                                </View>
                            ) : query.length === 0 && following.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>You aren&apos;t following anyone yet.</Text>
                                </View>
                            ) : null
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#1F2937",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "80%",
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
        marginBottom: 12,
        marginTop: 10,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#374151",
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: "#F9FAFB",
        fontSize: 16,
        fontFamily: "Nunito-Regular",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarContainer: {
        marginRight: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#374151",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
    name: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    inviteButton: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
    },
    inviteButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
        fontFamily: "Nunito-SemiBold",
    },
    memberBadge: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    memberBadgeText: {
        color: "#3B82F6",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "Nunito-SemiBold",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 16,
        fontFamily: "Nunito-Regular",
    },
});
