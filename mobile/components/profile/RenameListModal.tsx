import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RenameListModalProps {
    visible: boolean;
    onClose: () => void;
    currentTitle: string;
    onSubmit: (newTitle: string) => void;
}

export function RenameListModal({
    visible,
    onClose,
    currentTitle,
    onSubmit,
}: RenameListModalProps) {
    const [newTitle, setNewTitle] = useState(currentTitle);

    useEffect(() => {
        if (visible) {
            setNewTitle(currentTitle);
        }
    }, [visible, currentTitle]);

    const handleSubmit = () => {
        if (newTitle.trim() && newTitle !== currentTitle) {
            onSubmit(newTitle.trim());
        } else {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                        keyboardVerticalOffset={10}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Rename List</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.form}>
                                    <Text style={styles.label}>List Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newTitle}
                                        onChangeText={setNewTitle}
                                        placeholder="Enter new list name..."
                                        placeholderTextColor="#6B7280"
                                        autoFocus
                                    />

                                    <View style={styles.footer}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={onClose}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.submitButton,
                                                (!newTitle.trim() || newTitle === currentTitle) && styles.submitButtonDisabled,
                                            ]}
                                            onPress={handleSubmit}
                                            disabled={!newTitle.trim() || newTitle === currentTitle}
                                        >
                                            <Text style={styles.submitButtonText}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    keyboardView: {
        width: "100%",
        alignItems: "center",
    },
    content: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1F2937",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#374151",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F9FAFB",
        fontFamily: "Nunito-Bold",
    },
    closeButton: {
        padding: 4,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 15,
        color: "#F9FAFB",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#374151",
        marginBottom: 20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    cancelButtonText: {
        color: "#9CA3AF",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    submitButtonDisabled: {
        backgroundColor: "#1F2937",
        opacity: 0.5,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
