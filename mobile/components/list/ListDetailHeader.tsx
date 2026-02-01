import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookList } from "../../types/bookList";
import { jpg } from "../../assets/images";
import { useTranslation } from "react-i18next";

interface ListDetailHeaderProps {
    list: BookList;
    avatarUrl: string | null;
    isOwnList: boolean;
    isAlreadySaved: boolean;
    isSaving: boolean;
    onSave: () => void;
    onBack: () => void;
    onCopy?: () => void;
    onUsernamePress?: () => void;
    onManageCollaborators?: () => void;
}

export function ListDetailHeader({
    list,
    avatarUrl,
    isOwnList,
    isAlreadySaved,
    isSaving,
    onSave,
    onBack,
    onCopy,
    onUsernamePress,
    onManageCollaborators,
}: ListDetailHeaderProps) {
    const [imageError, setImageError] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const savesCount = list.savedBy?.length || 0;
    const { t } = useTranslation();

    const handleCopy = async () => {
        if (!onCopy) return;
        setIsCopying(true);
        try {
            await onCopy();
        } finally {
            setIsCopying(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Title Section with Back Button */}
            <View style={styles.titleRow}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.title}>{list.title}</Text>
            </View>

            {/* Creator Row */}
            <TouchableOpacity
                style={styles.creatorRow}
                onPress={onUsernamePress}
                disabled={!onUsernamePress}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={
                            (avatarUrl && !imageError)
                                ? { uri: avatarUrl }
                                : jpg.avatar
                        }
                        style={styles.avatar}
                        onError={() => setImageError(true)}
                    />
                </View>
                <View style={styles.creatorInfo}>
                    <Text style={styles.creatorLabel}>A list by</Text>
                    <Text style={styles.creatorName}>{list.user.username}</Text>
                </View>
            </TouchableOpacity>

            {/* Description */}
            {list.description ? (
                <Text style={styles.description}>{list.description}</Text>
            ) : null}

            {/* Metadata Grid */}
            <View style={styles.metadataGrid}>
                <View style={styles.metadataRow}>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataValue}>{list.books.length}</Text>
                        <Text style={styles.metadataLabel}>Books</Text>
                    </View>
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataValue}>{savesCount}</Text>
                        <Text style={styles.metadataLabel}>Saves</Text>
                    </View>
                    <View style={styles.metadataItem}>
                        <View style={styles.visibilityBadge}>
                            <Ionicons
                                name={list.visibility === 'public' ? "globe-outline" : "lock-closed-outline"}
                                size={14}
                                color={list.visibility === 'private' ? "#64748B" : "#3B82F6"}
                            />
                            <Text style={[
                                styles.visibilityText,
                                list.visibility !== 'private' && styles.visibilityTextActive
                            ]}>
                                {list.visibility === 'public' ? "Public" : "Private"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {!isOwnList ? (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                isAlreadySaved && styles.saveButtonSaved
                            ]}
                            onPress={onSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={isAlreadySaved ? "checkmark-circle" : "bookmark-outline"}
                                        size={18}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.saveButtonText}>
                                        {isAlreadySaved ? "Saved" : "Save List"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={handleCopy}
                            disabled={isCopying}
                        >
                            {isCopying ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText}>Copy List</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.collaboratorButton}
                        onPress={onManageCollaborators}
                    >
                        <Ionicons name="people-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>{t('list.add_collaborators')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom Divider */}
            <View style={styles.divider} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#0F172A",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: -8,
    },
    title: {
        fontSize: 28,
        fontFamily: "Nunito-Black",
        color: "#FFFFFF",
        lineHeight: 34,
        flex: 1,
    },
    creatorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.15)",
        backgroundColor: "#1E293B",
    },
    creatorInfo: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    creatorLabel: {
        fontSize: 14,
        color: "#64748B",
        fontFamily: "Nunito-Medium",
    },
    creatorName: {
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#E2E8F0",
    },
    description: {
        fontSize: 15,
        fontFamily: "Nunito-Regular",
        color: "#94A3B8",
        lineHeight: 22,
        marginBottom: 16,
    },
    metadataGrid: {
        marginBottom: 16,
    },
    metadataRow: {
        flexDirection: "row",
        gap: 24,
    },
    metadataItem: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    metadataValue: {
        fontSize: 18,
        fontFamily: "Nunito-Black",
        color: "#F1F5F9",
    },
    metadataLabel: {
        fontSize: 13,
        fontFamily: "Nunito-SemiBold",
        color: "#64748B",
    },
    visibilityBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    visibilityText: {
        fontSize: 12,
        fontFamily: "Nunito-Bold",
        color: "#64748B",
    },
    visibilityTextActive: {
        color: "#3B82F6",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontFamily: "Nunito-Bold",
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    saveButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    copyButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    saveButtonSaved: {
        backgroundColor: "#10B981",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        marginBottom: 16,
    },
    collaboratorButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
});
