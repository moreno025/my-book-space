import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { userApi } from '../../constants/api';
import { getImageUrl } from '@/utils/url';
import { useAppFonts } from '../../hooks/useFonts';

interface FollowRequest {
    _id: string;
    username: string;
    name: string;
    avatar: string;
}

export default function FollowRequestsScreen() {
    const router = useRouter();
    const fontsLoaded = useAppFonts();
    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userApi.getFollowRequests();
            setRequests(response.data.requests);
        } catch (error) {
            console.error("Error fetching follow requests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAccept = async (id: string, username: string) => {
        try {
            await userApi.acceptFollowRequest(id);
            setRequests(prev => prev.filter(req => req._id !== id));
            Alert.alert("Success", `Accepted ${username}'s follow request`);
        } catch (error) {
            console.error("Error accepting request:", error);
            Alert.alert("Error", "Failed to accept request");
        }
    };

    const handleReject = async (id: string, username: string) => {
        try {
            await userApi.rejectFollowRequest(id);
            setRequests(prev => prev.filter(req => req._id !== id));
            Alert.alert("Success", `Rejected ${username}'s follow request`);
        } catch (error) {
            console.error("Error rejecting request:", error);
            Alert.alert("Error", "Failed to reject request");
        }
    };

    if (!fontsLoaded) return null;

    const renderItem = ({ item }: { item: FollowRequest }) => (
        <View style={styles.requestItem}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => router.push({ pathname: "/(app)/(tabs)/user/[username]", params: { username: item.username } })}
            >
                <Image source={{ uri: getImageUrl(item.avatar) as string }} style={styles.avatar} />
                <View style={styles.textInfo}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.name}>{item.name}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(item._id, item.username)}
                >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item._id, item.username)}
                >
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#0f172a']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Follow Requests</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#3b82f6" size="large" />
                    </View>
                ) : requests.length === 0 ? (
                    <View style={styles.center}>
                        <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.emptyText}>No pending requests</Text>
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        marginTop: 12,
    },
    listContent: {
        padding: 16,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    textInfo: {
        flex: 1,
    },
    username: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Nunito-Bold',
    },
    name: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: 'Nunito-Regular',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#3b82f6',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Nunito-Bold',
    },
    rejectButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
    },
});
