import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; visibility: "public" | "private" }) => Promise<void>;
}

export function CreateListModal({ visible, onClose, onSubmit }: CreateListModalProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ title, description, visibility });
            // Reset form
            setTitle("");
            setDescription("");
            setVisibility("public");
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    const visibilityOptions = [
        {
            id: "public",
            label: user?.isPrivate ? t('list.followers_only') : t('list.public'),
            icon: user?.isPrivate ? "people-outline" : "globe-outline",
            color: user?.isPrivate ? "#3B82F6" : "#10B981"
        },
        { id: "private", label: t('list.private'), icon: "lock-closed-outline", color: "#6B7280" },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.content}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('list.create_title')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('list.title_label')}</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder={t('list.title_placeholder')}
                                placeholderTextColor="#4B5563"
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('list.description_label')}</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder={t('list.description_placeholder')}
                                placeholderTextColor="#4B5563"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('list.visibility_label')}</Text>
                            <View style={styles.visibilityContainer}>
                                {visibilityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.visibilityOption,
                                            visibility === option.id && styles.visibilityOptionActive,
                                            { borderColor: visibility === option.id ? option.color : "transparent" }
                                        ]}
                                        onPress={() => setVisibility(option.id as any)}
                                    >
                                        <Ionicons
                                            name={option.icon as any}
                                            size={20}
                                            color={visibility === option.id ? option.color : "#94A3B8"}
                                        />
                                        <Text style={[
                                            styles.visibilityLabel,
                                            visibility === option.id && { color: option.color }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {user?.isPrivate && (
                                <Text style={styles.privacyHint}>
                                    {t('list.privacy_hint')}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, !title.trim() && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={!title.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.submitButtonText}>{t('list.create_button')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "flex-end",
    },
    content: {
        backgroundColor: "#1F2937",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#F9FAFB",
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#94A3B8",
    },
    input: {
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 16,
        color: "#F9FAFB",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    visibilityContainer: {
        flexDirection: "row",
        gap: 12,
    },
    visibilityOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    visibilityOptionActive: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    visibilityLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#94A3B8",
    },
    privacyHint: {
        fontSize: 12,
        color: "#94A3B8",
        fontStyle: "italic",
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
