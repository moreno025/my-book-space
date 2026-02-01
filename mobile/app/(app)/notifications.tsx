import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { notificationApi } from "@/constants/api";
import { Notification } from "@/types/notification";
import { useToast } from "@/context/ToastContext";
import { getImageUrl } from "@/utils/url";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { showToast } = useToast();

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.getAll();
            setNotifications(res.data.notifications);
        } catch (error) {
            console.error(error);
            showToast("Failed to load notifications", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            showToast("All marked as read", "success");
        } catch (error) {
            showToast("Failed to mark all as read", "error");
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                await notificationApi.markAsRead(notification._id);
                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error("Error marking as read", error);
            }
        }

        // Navigate based on type
        if (notification.type === 'collaborator_added' && notification.data.listId) {
            router.push(`/list/${notification.data.listId}`);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: i18n.language === 'es' ? es : enUS
        });

        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
                onPress={() => handleNotificationPress(item)}
            >
                <Image
                    source={{ uri: (item.sender.avatar && getImageUrl(item.sender.avatar)) || "https://placehold.co/100x100/png" }}
                    style={styles.avatar}
                />
                <View style={styles.content}>
                    <Text style={styles.message}>
                        <Text style={styles.username}>{item.sender.username}</Text>
                        {" "}{t(`notifications.${item.type}`)}{" "}
                        <Text style={styles.highlight}>{item.data.listTitle || "list"}</Text>
                    </Text>
                    <Text style={styles.time}>{timeAgo}</Text>
                </View>
                {!item.isRead && <View style={styles.dot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('notifications.title')}</Text>
                {notifications.some(n => !n.isRead) && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Ionicons name="checkmark-done-outline" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color="#64748B" />
                            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1E293B",
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        fontFamily: "Nunito-Bold",
    },
    listContent: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    unreadItem: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: "#1E293B",
    },
    content: {
        flex: 1,
    },
    message: {
        color: "#E2E8F0",
        fontSize: 15,
        fontFamily: "Nunito-Regular",
        marginBottom: 4,
    },
    username: {
        fontWeight: "bold",
        color: "#FFF",
        fontFamily: "Nunito-Bold",
    },
    highlight: {
        fontWeight: "bold",
        color: "#FFF",
        fontStyle: "italic",
    },
    time: {
        color: "#64748B",
        fontSize: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#3B82F6",
        marginLeft: 8,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 16,
        marginTop: 12,
        fontFamily: "Nunito-Medium",
    },
});
