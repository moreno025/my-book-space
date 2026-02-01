import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookClub } from "@/types/bookClub";
import { bookClubApi } from "@/constants/api/bookClub";

import InviteMemberModal from "./InviteMemberModal";
import { getImageUrl } from "@/utils/images";

interface MemberManagementSectionProps {
    club: BookClub;
    onUpdate: () => void;
}

export default function MemberManagementSection({ club, onUpdate }: MemberManagementSectionProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const handleApproveRequest = async (userId: string, username: string) => {
        try {
            setLoading(userId);
            await bookClubApi.approveJoinRequest(club._id, userId);
            Alert.alert("Success", `${username} has been added to the club`);
            onUpdate();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to approve request");
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveMember = async (userId: string, username: string) => {
        Alert.alert(
            "Remove Member",
            `Are you sure you want to remove ${username} from the club?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(userId);
                            await bookClubApi.removeMember(club._id, userId);
                            Alert.alert("Success", `${username} has been removed from the club`);
                            onUpdate();
                        } catch (error: any) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to remove member");
                        } finally {
                            setLoading(null);
                        }
                    },
                },
            ]
        );
    };

    const pendingRequests = club.pendingInvites || [];
    const members = club.members || [];

    return (
        <View style={styles.container}>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Pending Requests ({pendingRequests.length})
                    </Text>
                    {pendingRequests.map((user) => (
                        <View key={user._id} style={styles.memberCard}>
                            <View style={styles.memberAvatar}>
                                {user.avatar ? (
                                    <Image source={{ uri: getImageUrl(user.avatar) || undefined }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person" size={20} color="#3B82F6" />
                                )}
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{user.username}</Text>
                                <Text style={styles.memberRole}>Requested to join</Text>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.approveButton}
                                    onPress={() => handleApproveRequest(user._id, user.username)}
                                    disabled={loading === user._id}
                                >
                                    {loading === user._id ? (
                                        <ActivityIndicator size="small" color="#10B981" />
                                    ) : (
                                        <Ionicons name="checkmark" size={20} color="#10B981" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    disabled={loading === user._id}
                                >
                                    <Ionicons name="close" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Current Members */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Members ({members.length})
                </Text>
                {members.map((member) => {
                    const isAdmin = member._id === club.admin._id;
                    return (
                        <View key={member._id} style={styles.memberCard}>
                            <View style={styles.memberAvatar}>
                                {member.avatar ? (
                                    <Image source={{ uri: getImageUrl(member.avatar) || undefined }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person" size={20} color="#3B82F6" />
                                )}
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.username}</Text>
                                {isAdmin && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                            {!isAdmin && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveMember(member._id, member.username)}
                                    disabled={loading === member._id}
                                >
                                    {loading === member._id ? (
                                        <ActivityIndicator size="small" color="#EF4444" />
                                    ) : (
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Invite Members Button */}
            <TouchableOpacity style={styles.inviteButton} onPress={() => setShowInviteModal(true)}>
                <Ionicons name="person-add-outline" size={20} color="#3B82F6" />
                <Text style={styles.inviteButtonText}>Invite Members</Text>
            </TouchableOpacity>

            <InviteMemberModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                clubId={club._id}
                currentMembers={members.map(m => m._id)}
                onInviteSuccess={() => {
                    onUpdate();
                    // Optional: keep modal open or close?
                    // Let's keep it open to invite more, but update list behind.
                    // But if we want to see the new member in list, we need to refresh.
                    // The onUpdate triggers a refresh in parent.
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#F9FAFB",
        marginBottom: 12,
        fontFamily: "Nunito-Bold",
    },
    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F2937",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        overflow: "hidden",
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    memberRole: {
        fontSize: 13,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
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
    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },
    approveButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    rejectButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    inviteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 1,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    inviteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#3B82F6",
        fontFamily: "Nunito-SemiBold",
    },
});
