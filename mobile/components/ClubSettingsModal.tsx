import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Image,
    Alert,
} from "react-native";
import { getImageUrl } from "@/utils/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BookClub } from "@/types/bookClub";
import MemberManagementSection from "./MemberManagementSection";
import BookSelectionModal from "./BookSelectionModal";
import { bookClubApi } from "@/constants/api/bookClub";
type TabType = "general" | "members" | "books";

interface ClubSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    club: BookClub;
    isAdmin: boolean;
    onUpdate: () => void;
}

export default function ClubSettingsModal({
    visible,
    onClose,
    club,
    isAdmin,
    onUpdate,
}: ClubSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>(isAdmin ? "general" : "members");

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isAdmin ? "Club Settings" : "Club Info"}
                    </Text>
                    <View style={styles.closeButton} />
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {isAdmin && (
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "general" && styles.tabActive]}
                            onPress={() => setActiveTab("general")}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={20}
                                color={activeTab === "general" ? "#3B82F6" : "#9CA3AF"}
                            />
                            <Text style={[styles.tabText, activeTab === "general" && styles.tabTextActive]}>
                                General
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "members" && styles.tabActive]}
                        onPress={() => setActiveTab("members")}
                    >
                        <Ionicons
                            name="people-outline"
                            size={20}
                            color={activeTab === "members" ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Text style={[styles.tabText, activeTab === "members" && styles.tabTextActive]}>
                            Members
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "books" && styles.tabActive]}
                        onPress={() => setActiveTab("books")}
                    >
                        <Ionicons
                            name="book-outline"
                            size={20}
                            color={activeTab === "books" ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Text style={[styles.tabText, activeTab === "books" && styles.tabTextActive]}>
                            Books
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <ScrollView style={styles.content}>
                    {activeTab === "general" && isAdmin && (
                        <GeneralSettings club={club} onUpdate={onUpdate} onClose={onClose} />
                    )}
                    {activeTab === "members" && (
                        <MemberSettings club={club} onUpdate={onUpdate} isAdmin={isAdmin} />
                    )}
                    {activeTab === "books" && (
                        <BookSettings club={club} onUpdate={onUpdate} onClose={onClose} isAdmin={isAdmin} />
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

// General Settings Tab
function GeneralSettings({
    club,
    onUpdate,
    onClose,
}: {
    club: BookClub;
    onUpdate: () => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(club.name);
    const [description, setDescription] = useState(club.description || "");
    const [visibility, setVisibility] = useState<"public" | "private">(club.visibility);
    const [avatar, setAvatar] = useState(club.avatar || "");
    const [saving, setSaving] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "We need access to your photos to change the club avatar.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0].uri) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await bookClubApi.updateClub(club._id, {
                name,
                description,
                visibility,
                avatar,
            });
            Alert.alert("Success", "Club settings updated successfully");
            onUpdate();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to update club");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Information</Text>

            {/* Avatar Section */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Club Avatar</Text>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarPreview}>
                        {avatar ? (
                            <Image source={{ uri: getImageUrl(avatar) || undefined }} style={styles.avatarPreviewImage} />
                        ) : (
                            <Ionicons name="people" size={40} color="#3B82F6" />
                        )}
                    </View>
                    <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
                        <Ionicons name="images-outline" size={20} color="#3B82F6" />
                        <Text style={styles.changeAvatarText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Club Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter club name"
                    placeholderTextColor="#6B7280"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter club description"
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Visibility</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setVisibility("public")}
                    >
                        <View style={styles.radio}>
                            {visibility === "public" && <View style={styles.radioSelected} />}
                        </View>
                        <Text style={styles.radioText}>Public - Anyone can join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setVisibility("private")}
                    >
                        <View style={styles.radio}>
                            {visibility === "private" && <View style={styles.radioSelected} />}
                        </View>
                        <Text style={styles.radioText}>Private - Invite only</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                    <ActivityIndicator size="small" color="#F9FAFB" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// Member Settings Tab
function MemberSettings({ club, onUpdate, isAdmin }: { club: BookClub; onUpdate: () => void; isAdmin: boolean }) {
    if (!isAdmin) {
        // Read-only view for non-admins
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Members ({club.members.length})</Text>
                {club.members.map((member) => {
                    const isMemberAdmin = member._id === club.admin._id;
                    return (
                        <View key={member._id} style={styles.memberCard}>
                            <View style={styles.memberAvatar}>
                                {member.avatar ? (
                                    <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person" size={20} color="#3B82F6" />
                                )}
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.username}</Text>
                                {isMemberAdmin && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    }

    // Admin view with management controls
    return (
        <View style={styles.section}>
            <MemberManagementSection club={club} onUpdate={onUpdate} />
        </View>
    );
}

// Book Settings Tab
function BookSettings({
    club,
    onUpdate,
    onClose,
    isAdmin,
}: {
    club: BookClub;
    onUpdate: () => void;
    onClose: () => void;
    isAdmin: boolean;
}) {
    const [bookModalVisible, setBookModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSelectBook = async (book: any) => {
        try {
            setLoading(true);
            await bookClubApi.setCurrentBook(club._id, {
                googleBookId: book.id,
                title: book.title,
                authors: book.authors || [],
                thumbnail: book.coverUrl || "",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            });
            Alert.alert("Success", `"${book.title}" has been set as the current book`);
            onUpdate();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to set current book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Discussion Book</Text>

            {club.currentBook ? (
                <View style={styles.currentBookCard}>
                    <Image
                        source={{ uri: club.currentBook.thumbnail }}
                        style={styles.currentBookCover}
                        resizeMode="cover"
                    />
                    <View style={styles.currentBookInfo}>
                        <Text style={styles.currentBookTitle}>{club.currentBook.title}</Text>
                        <Text style={styles.currentBookAuthors}>
                            {club.currentBook.authors.join(", ")}
                        </Text>
                        {club.currentBook.startDate && (
                            <Text style={styles.currentBookDate}>
                                Started: {new Date(club.currentBook.startDate).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
            ) : (
                <View style={styles.noBookCard}>
                    <Ionicons name="book-outline" size={48} color="#4B5563" />
                    <Text style={styles.noBookText}>No current book set</Text>
                </View>
            )}

            {isAdmin && (
                <>
                    <TouchableOpacity
                        style={styles.setBookButton}
                        onPress={() => setBookModalVisible(true)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#F9FAFB" />
                        ) : (
                            <>
                                <Ionicons name="add-circle-outline" size={20} color="#F9FAFB" />
                                <Text style={styles.setBookButtonText}>
                                    {club.currentBook ? "Change Current Book" : "Set Current Book"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <BookSelectionModal
                        visible={bookModalVisible}
                        onClose={() => setBookModalVisible(false)}
                        onSelectBook={handleSelectBook}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#3B82F6",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
        fontFamily: "Nunito-SemiBold",
    },
    tabTextActive: {
        color: "#3B82F6",
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        marginBottom: 20,
        fontFamily: "Nunito-Bold",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#D1D5DB",
        marginBottom: 8,
        fontFamily: "Nunito-SemiBold",
    },
    input: {
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: "#374151",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: "#F9FAFB",
        fontFamily: "Nunito-Regular",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    radioGroup: {
        gap: 12,
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#3B82F6",
    },
    radioText: {
        fontSize: 15,
        color: "#F9FAFB",
        fontFamily: "Nunito-Regular",
    },
    saveButton: {
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
    placeholderText: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 40,
        fontFamily: "Nunito-Regular",
    },
    currentBookCard: {
        flexDirection: "row",
        backgroundColor: "#1F2937",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    currentBookCover: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: "#374151",
        marginRight: 16,
    },
    currentBookInfo: {
        flex: 1,
        justifyContent: "center",
    },
    currentBookTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 6,
        fontFamily: "Nunito-SemiBold",
    },
    currentBookAuthors: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 4,
        fontFamily: "Nunito-Regular",
    },
    currentBookDate: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: "Nunito-Regular",
    },
    noBookCard: {
        backgroundColor: "#1F2937",
        padding: 40,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    noBookText: {
        fontSize: 15,
        color: "#9CA3AF",
        marginTop: 12,
        fontFamily: "Nunito-Regular",
    },
    setBookButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        paddingVertical: 14,
    },
    setBookButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
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
    avatarSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    avatarPreview: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarPreviewImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    changeAvatarButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    changeAvatarText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3B82F6",
        fontFamily: "Nunito-SemiBold",
    },
});
