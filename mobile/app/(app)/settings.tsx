import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getImageUrl } from '@/utils/url';

export default function Settings() {
    const { logout, user, updateUserProfile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(user?.name || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);

    // For local preview of new image
    const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);

    // Entrance animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setLastName(user.lastName || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
            setAvatar(user.avatar || null);
        }
    }, [user]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();

        formData.append("name", name);
        formData.append("lastName", lastName);
        formData.append("username", username);
        formData.append("bio", bio);

        // Always sending email is risky if not changing it, but backend might require it or ignore it.
        // Assuming backend merges updates.
        // formData.append("email", user?.email || ""); 

        if (newAvatarUri) {
            const filename = newAvatarUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || "");
            const ext = match ? match[1] : "jpeg";
            const type = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

            // @ts-ignore: FormData expects specific object shape for files in RN
            formData.append("avatar", {
                uri: newAvatarUri,
                name: filename,
                type,
            });
        }

        const success = await updateUserProfile(formData);

        if (success) {
            Alert.alert("Success", "Profile updated successfully");
            setNewAvatarUri(null); // Reset preview, actual avatar should update from context
        } else {
            Alert.alert("Error", "Failed to update profile");
        }
        setIsSaving(false);
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const imageSource = newAvatarUri
        ? { uri: newAvatarUri }
        : (avatar ? { uri: getImageUrl(avatar) as string } : null);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#0f172a']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <Text style={styles.headerSubtitle}>Manage your profile & preferences</Text>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                    style={styles.keyboardAware}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraHeight={200}
                    extraScrollHeight={150}
                    enableResetScrollToCoords={true}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
                            <View style={styles.avatarGlow} />
                            {imageSource ? (
                                <Image source={imageSource} style={styles.avatar} />
                            ) : (
                                <LinearGradient
                                    colors={['#3b82f6', '#2563eb']}
                                    style={[styles.avatar, styles.avatarPlaceholder]}
                                >
                                    <Ionicons name="person" size={48} color="rgba(255,255,255,0.9)" />
                                </LinearGradient>
                            )}
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>

                    {/* Glass Form Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <Input
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={styles.premiumInput}
                                borderColor="rgba(255,255,255,0.15)"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>First Name</Text>
                                <Input
                                    placeholder="First Name"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    style={styles.premiumInput}
                                    borderColor="rgba(255,255,255,0.15)"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.label}>Last Name</Text>
                                <Input
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    style={styles.premiumInput}
                                    borderColor="rgba(255,255,255,0.15)"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <Input
                                placeholder="Tell us about yourself..."
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                style={[styles.premiumInput, { height: 100, paddingTop: 12 }]}
                                borderColor="rgba(255,255,255,0.15)"
                            />
                        </View>

                        <Button
                            title={isSaving ? "Saving..." : "Save Changes"}
                            onPress={handleSave}
                            disabled={isSaving}
                            style={styles.saveButton}
                        />
                    </View>

                    {/* Sign Out Section */}
                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Ionicons name="log-out-outline" size={20} color="#f87171" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>

                    <View style={styles.footerSpacer} />
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </Animated.View>
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
    keyboardAware: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 38,
        color: '#fff',
        fontFamily: 'Nunito-Regular',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        fontFamily: 'Nunito-Regular',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
        // Shadow for glowing effect
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarGlow: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        bottom: -10,
        borderRadius: 60,
        backgroundColor: '#3b82f6',
        opacity: 0.3,
        transform: [{ scale: 0.9 }],
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#2563eb',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#0f172a',
    },
    emailText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15,
        fontFamily: 'Nunito-Medium',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'Nunito-Bold',
        marginLeft: 4,
    },
    premiumInput: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        borderWidth: 1,
        fontSize: 16,
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    saveButton: {
        marginTop: 12,
        backgroundColor: '#da6c12', // Maintaining brand accent
        shadowColor: "#da6c12",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        gap: 8,
    },
    signOutText: {
        color: '#f87171',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Nunito-Bold',
    },
    footerSpacer: {
        height: 200,
    }
});
