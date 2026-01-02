import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing } from "react-native";
import { useState, useRef } from "react";
import { User } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getImageUrl } from "@/utils/url";

interface ProfileHeaderProps {
    user: User | null;
    onAddList?: () => void;
    listsCount?: number;
    isOwnProfile?: boolean;
    isFollowing?: boolean;
    onFollow?: () => void;
    onBack?: () => void;
}

export function ProfileHeader({
    user,
    onAddList,
    listsCount,
    isOwnProfile = true,
    isFollowing = false,
    onFollow,
    onBack
}: ProfileHeaderProps) {
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    // Animation values
    const settingsScale = useRef(new Animated.Value(1)).current;
    const avatarScale = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    const followScale = useRef(new Animated.Value(1)).current;


    const handlePress = (target: 'settings' | 'avatar' | 'add' | 'follow' | 'back') => {
        let scaleVal;

        switch (target) {
            case 'settings':
            case 'back':
                scaleVal = settingsScale;
                break;
            case 'avatar':
                scaleVal = avatarScale;
                break;
            case 'add':
                scaleVal = addScale;
                break;
            case 'follow':
                scaleVal = followScale;
                break;
            default:
                scaleVal = new Animated.Value(1);
        }

        Animated.sequence([
            Animated.timing(scaleVal, {
                toValue: 0.82,
                duration: 120,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(scaleVal, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => {
            if (target === 'settings') {
                router.push('/settings');
            } else if (target === 'back' && onBack) {
                onBack();
            } else if (target === 'avatar') {
                if (isOwnProfile) {
                    router.push('/settings');
                }
            } else if (target === 'add' && onAddList) {
                onAddList();
            } else if (target === 'follow' && onFollow) {
                onFollow();
            }
        }, scaleVal ? 250 : 0); // Adjust timeout based on whether animation occurred
    };

    if (!user) return null;

    const stats = [
        { label: "followers", value: user.followersCount || 0 },
        { label: "following", value: user.followingCount || 0 },
        { label: "lists", value: listsCount ?? user.listsCount ?? 0 },
    ];

    return (
        <View style={styles.container}>
            {/* Top Bar for Navigation/Settings */}
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity
                        onPress={() => handlePress(isOwnProfile ? 'settings' : 'back')}
                        activeOpacity={0.7}
                        style={styles.iconButton}
                    >
                        <Ionicons
                            name={isOwnProfile ? "settings-outline" : "arrow-back"}
                            size={24}
                            color="#F9FAFB"
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>@{user.username}</Text>

                <View style={styles.topBarRight}>
                    {isOwnProfile && onAddList && (
                        <TouchableOpacity
                            onPress={() => handlePress('add')}
                            style={styles.iconButton}
                        >
                            <Ionicons name="add-circle-outline" size={28} color="#F9FAFB" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.headerContent}>
                {/* Top Section: Avatar + Stats + Actions */}
                <View style={styles.topSection}>
                    <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => handlePress('avatar')}
                            activeOpacity={isOwnProfile ? 0.8 : 1}
                            disabled={!isOwnProfile}
                        >
                            <Image
                                source={
                                    user.avatar && !imageError
                                        ? { uri: getImageUrl(user.avatar) as string }
                                        : require("../../assets/images/avatar.jpg")
                                }
                                style={styles.avatar}
                                onError={() => setImageError(true)}
                            />
                            {isOwnProfile && <View style={styles.statusBadge} />}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Right Section: Stats + Button */}
                    <View style={styles.rightSection}>
                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            {stats.map((stat, index) => (
                                <View key={index} style={styles.statItem}>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        {!isOwnProfile && (
                            <Animated.View style={{ transform: [{ scale: followScale }], width: '100%', marginTop: 12 }}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        isFollowing ? styles.followingButton : styles.followButton
                                    ]}
                                    onPress={() => handlePress('follow')}
                                    activeOpacity={0.9}
                                >
                                    <Text style={[
                                        styles.actionButtonText,
                                        isFollowing ? styles.followingButtonText : styles.followButtonText
                                    ]}>
                                        {isFollowing ? "Following" : "Follow"}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </View>

                {/* User Bio Section Removed */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#0B0F19",
        paddingBottom: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        height: 50,
        alignItems: 'center',
    },
    topBarLeft: {
        width: 40,
        alignItems: 'flex-start',
    },
    topBarRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontFamily: "Nunito-Bold",
        fontSize: 18,
        color: "#F9FAFB",
    },
    iconButton: {
        padding: 4,
    },
    headerContent: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#1F2937",
        backgroundColor: "#1F2937",
    },
    statusBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#10B981",
        borderWidth: 2,
        borderColor: "#0B0F19",
    },
    rightSection: {
        flex: 1,
        marginLeft: 20,
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontFamily: "Nunito-SemiBold", // Slightly bolder than regular for numbers to be readable
        color: "#F9FAFB",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 13,
        fontFamily: "Nunito-Regular",
        color: "#F9FAFB",
    },

    actionButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 8,
        width: '100%',
    },
    followButton: {
        backgroundColor: "#3B82F6",
    },
    followingButton: {
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: "#374151",
    },
    actionButtonText: {
        fontSize: 14,
        fontFamily: "Nunito-SemiBold",
    },
    followButtonText: {
        color: "#FFFFFF",
    },
    followingButtonText: {
        color: "#F9FAFB",
    },
});