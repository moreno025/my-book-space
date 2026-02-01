import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBookClubs } from "@/hooks/useBookClubs";

export default function CreateClubScreen() {
    const router = useRouter();
    const { createClub } = useBookClubs();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Club name is required");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await createClub({
                name: name.trim(),
                description: description.trim() || undefined,
                visibility,
            });
            router.back();
        } catch (err: any) {
            setError(err.message || "Failed to create club");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Book Club</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Club Name */}
                <View style={styles.section}>
                    <Text style={styles.label}>Club Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Sci-Fi Lovers, Mystery Readers..."
                        placeholderTextColor="#6B7280"
                        value={name}
                        onChangeText={setName}
                        maxLength={50}
                    />
                    <Text style={styles.charCount}>{name.length}/50</Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's this club about? What kind of books will you read?"
                        placeholderTextColor="#6B7280"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={200}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{description.length}/200</Text>
                </View>

                {/* Visibility */}
                <View style={styles.section}>
                    <Text style={styles.label}>Visibility</Text>
                    <View style={styles.visibilityOptions}>
                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                visibility === 'public' && styles.visibilityOptionActive
                            ]}
                            onPress={() => setVisibility('public')}
                        >
                            <View style={styles.visibilityHeader}>
                                <Ionicons
                                    name="globe-outline"
                                    size={24}
                                    color={visibility === 'public' ? "#3B82F6" : "#9CA3AF"}
                                />
                                <Text style={[
                                    styles.visibilityTitle,
                                    visibility === 'public' && styles.visibilityTitleActive
                                ]}>
                                    Public
                                </Text>
                            </View>
                            <Text style={styles.visibilityDescription}>
                                Anyone can discover and join this club
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                visibility === 'private' && styles.visibilityOptionActive
                            ]}
                            onPress={() => setVisibility('private')}
                        >
                            <View style={styles.visibilityHeader}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={24}
                                    color={visibility === 'private' ? "#3B82F6" : "#9CA3AF"}
                                />
                                <Text style={[
                                    styles.visibilityTitle,
                                    visibility === 'private' && styles.visibilityTitleActive
                                ]}>
                                    Private
                                </Text>
                            </View>
                            <Text style={styles.visibilityDescription}>
                                Only invited members can join
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Create Button */}
                <TouchableOpacity
                    style={[styles.createButton, loading && styles.createButtonDisabled]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#F9FAFB" />
                    ) : (
                        <>
                            <Ionicons name="add-circle-outline" size={20} color="#F9FAFB" />
                            <Text style={styles.createButtonText}>Create Club</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        marginBottom: 8,
        fontFamily: "Nunito-SemiBold",
    },
    input: {
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: "#374151",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#F9FAFB",
        fontFamily: "Nunito-Regular",
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    charCount: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        textAlign: "right",
        fontFamily: "Nunito-Regular",
    },
    visibilityOptions: {
        gap: 12,
    },
    visibilityOption: {
        backgroundColor: "#1F2937",
        borderWidth: 2,
        borderColor: "#374151",
        borderRadius: 12,
        padding: 16,
    },
    visibilityOptionActive: {
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    visibilityHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    visibilityTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#D1D5DB",
        fontFamily: "Nunito-SemiBold",
    },
    visibilityTitleActive: {
        color: "#3B82F6",
    },
    visibilityDescription: {
        fontSize: 14,
        color: "#9CA3AF",
        fontFamily: "Nunito-Regular",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        flex: 1,
        fontFamily: "Nunito-Regular",
    },
    createButton: {
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 8,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
        fontFamily: "Nunito-SemiBold",
    },
});
