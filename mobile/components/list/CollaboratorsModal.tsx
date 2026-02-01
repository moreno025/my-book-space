import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userApi } from "../../constants/api";
import { getImageUrl } from "@/utils/url";
import { useToast } from "../../context/ToastContext";

interface CollaboratorsModalProps {
    visible: boolean;
    onClose: () => void;
    listId: string;
    currentCollaborators: string[];
    onAdd: (userId: string) => Promise<boolean>;
    onRemove: (userId: string) => Promise<boolean>;
}

export const CollaboratorsModal = ({ visible, onClose, listId, currentCollaborators, onAdd, onRemove }: CollaboratorsModalProps) => {
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (visible) {
            fetchFriends();
        }
    }, [visible]);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const res = await userApi.getFriends();
            setFriends(res.data.friends);
        } catch (error) {
            console.error(error);
            showToast("Failed to load friends", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCollaborator = async (friendId: string) => {
        const isCollaborator = currentCollaborators.includes(friendId);
        setProcessing(friendId);
        try {
            if (isCollaborator) {
                await onRemove(friendId);
                showToast("Collaborator removed", "success");
            } else {
                await onAdd(friendId);
                showToast("Collaborator added", "success");
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessing(null);
        }
    };

    const renderFriend = ({ item }: { item: any }) => {
        const isCollaborator = currentCollaborators.includes(item._id);
        const isProcessing = processing === item._id;

        return (
            <View style={styles.friendRow}>
                <Image
                    source={{ uri: (item.avatar && getImageUrl(item.avatar)) || "https://placehold.co/100x100/png" }}
                    style={styles.avatar}
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name || item.username}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.actionButton, isCollaborator ? styles.removeButton : styles.addButton]}
                    onPress={() => handleToggleCollaborator(item._id)}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={isCollaborator ? "#EF4444" : "#FFF"} size="small" />
                    ) : (
                        <Text style={[styles.buttonText, isCollaborator && styles.removeButtonText]}>
                            {isCollaborator ? "Remove" : "Add"}
                        </Text>
                    )}
                </TouchableOpacity>
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Manage Collaborators</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Only mutual followers can be added.</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={friends}
                            keyExtractor={item => item._id}
                            renderItem={renderFriend}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>You don't have any mutual followers yet.</Text>
                            }
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "80%",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E293B",
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    friendRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#E2E8F0",
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
    },
    username: {
        fontSize: 14,
        color: "#64748B",
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 80,
        alignItems: "center",
    },
    addButton: {
        backgroundColor: "#3B82F6",
    },
    removeButton: {
        backgroundColor: "#FEE2E2",
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    removeButtonText: {
        color: "#EF4444",
    },
    emptyText: {
        textAlign: "center",
        color: "#64748B",
        marginTop: 40,
        fontSize: 16,
    }
});
