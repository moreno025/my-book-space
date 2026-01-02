import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { userApi, bookListApi } from "../../../constants/api";
import { User } from "../../../types/user";
import { BookList } from "../../../types/bookList";
import { useAppFonts } from "../../../hooks/useFonts";
import { useToast } from "../../../context/ToastContext";
import { BookListCarousel } from "../../../components/profile/BookListCarousel";
import { ProfileHeader } from "../../../components/profile/ProfileHeader";

export default function UserProfileScreen() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const router = useRouter();
    const fontsLoaded = useAppFonts();
    const { showToast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [lists, setLists] = useState<BookList[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, [username]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const userResponse = await userApi.getUserByUsername(username);
            setUser(userResponse.data);
            setFollowing(userResponse.data.isFollowing || false);

            // Only fetch lists if we can view the profile
            if (userResponse.data.canViewFullProfile) {
                const listsResponse = await userApi.getUserLists(username);
                setLists(listsResponse.data.lists || []);
            }
        } catch (error: any) {
            console.error("Error fetching user profile:", error);
            showToast(error.response?.data?.message || "Failed to load profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) return;

        // Optimistic update
        const previousFollowing = following;
        const previousFollowersCount = user.followersCount || 0;

        // Update local state immediately
        setFollowing(!previousFollowing);
        setUser({
            ...user,
            followersCount: previousFollowing
                ? previousFollowersCount - 1
                : previousFollowersCount + 1
        });

        try {
            if (previousFollowing) {
                await userApi.unfollowUser(user.id);
                showToast(`Unfollowed ${user.username}`, "success");
            } else {
                await userApi.followUser(user.id);
                showToast(`Following ${user.username}`, "success");
            }
        } catch (error: any) {
            // Revert on error
            console.error("Error following/unfollowing user:", error);
            setFollowing(previousFollowing);
            setUser({
                ...user,
                followersCount: previousFollowersCount
            });
            showToast(error.response?.data?.message || "Failed to update follow status", "error");
        }
    };

    const handleCopyList = async (listId: string) => {
        try {
            await bookListApi.copyList(listId);
            showToast("List copied to your profile", "success");
        } catch (error: any) {
            console.error("Failed to copy list:", error);
            showToast(error.response?.data?.message || "Failed to copy list", "error");
        }
    };

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>User not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const canViewProfile = user.canViewFullProfile;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <ProfileHeader
                    user={user}
                    listsCount={lists.length}
                    isOwnProfile={false}
                    isFollowing={following}
                    onFollow={handleFollow}
                    onBack={() => router.back()}
                />

                {user.isPrivate && !canViewProfile && (
                    <View style={styles.privateNotice}>
                        <Ionicons name="lock-closed" size={20} color="#94A3B8" />
                        <Text style={styles.privateText}>This account is private</Text>
                    </View>
                )}

                {/* Lists Section */}
                {canViewProfile && lists.length > 0 && (
                    <View style={styles.listsSection}>
                        {lists.map((list) => (
                            <BookListCarousel
                                key={list._id}
                                title={list.title}
                                listId={list._id}
                                isPublic={list.isPublic}
                                ownerId={list.user._id}
                                books={list.books || []}
                                onCopy={handleCopyList}
                            />
                        ))}
                    </View>
                )}

                {canViewProfile && lists.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="albums-outline" size={48} color="#4B5563" />
                        <Text style={styles.emptyText}>No lists yet</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0F19",
    },
    safe: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0F172A",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#0F172A",
    },
    errorText: {
        color: "#F9FAFB",
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        textAlign: "center",
        marginBottom: 20,
    },
    backLink: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#2563EB",
        borderRadius: 8,
    },
    backLinkText: {
        color: "#FFFFFF",
        fontFamily: "Nunito-Bold",
    },
    privateNotice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 24,
        padding: 16,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        marginHorizontal: 20,
    },
    privateText: {
        fontSize: 14,
        fontFamily: "Nunito-Medium",
        color: "#94A3B8",
    },
    listsSection: {
        flex: 1,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontFamily: "Nunito-Medium",
        marginTop: 12,
    },
});
