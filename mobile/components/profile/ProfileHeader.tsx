import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { User } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";

interface ProfileHeaderProps {
    user: User | null;
    onAddList?: () => void;
    listsCount?: number;
}

export function ProfileHeader({ user, onAddList, listsCount }: ProfileHeaderProps) {
    const [imageError, setImageError] = useState(false);

    if (!user) return null;

    const stats = [
        { label: "Followers", value: user.followersCount || 0 },
        { label: "Following", value: user.followingCount || 0 },
        { label: "Lists", value: listsCount ?? user.listsCount ?? 0 },
    ];

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color="#E5E7EB" />
            </TouchableOpacity>

            {onAddList && (
                <TouchableOpacity style={styles.addButton} onPress={onAddList}>
                    <Ionicons name="add-circle-outline" size={28} color="#3B82F6" />
                </TouchableOpacity>
            )}

            <View style={styles.headerContent}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <Image
                        source={
                            user.avatar && !imageError
                                ? { uri: user.avatar }
                                : require("../../assets/images/avatar.jpg")
                        }
                        style={styles.avatar}
                        onError={() => setImageError(true)}
                    />
                    <View style={styles.statusBadge} />
                </View>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    {!!user.name && <Text style={styles.name}>{user.name}</Text>}
                    <Text style={styles.email}>{user.username}</Text>
                </View>

                {/* Actions
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.shareButton}>
                        <Text style={styles.shareButtonText}>Share Profile</Text>
                    </TouchableOpacity>
                </View>*/}

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#0B0F19",
        paddingTop: 20,
        paddingBottom: 20,
        position: "relative",
    },
    settingsButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
    },
    addButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
    },
    headerContent: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#1F2937",
        backgroundColor: "#9ca1a7ff",
    },
    statusBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#10B981",
        borderWidth: 3,
        borderColor: "#0B0F19",
    },
    infoContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#F9FAFB",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
    },
    shareButton: {
        backgroundColor: "#1F2937",
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        minWidth: 120,
        alignItems: "center",
    },
    shareButtonText: {
        color: "#E5E7EB",
        fontWeight: "600",
        fontSize: 13,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: "#1F2937",
        paddingTop: 20,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#F9FAFB",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
});