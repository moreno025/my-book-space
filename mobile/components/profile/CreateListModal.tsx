import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; isPublic: boolean }) => Promise<void>;
}

export function CreateListModal({ visible, onClose, onSubmit }: CreateListModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setIsPublic(true);
        onClose();
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;

        try {
            setLoading(true);
            await onSubmit({ title, description, isPublic });
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardWrapper}
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>Create New List</Text>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Summer Reading"
                                    placeholderTextColor="#6B7280"
                                    value={title}
                                    onChangeText={setTitle}
                                    autoFocus
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="What is this list about?"
                                    placeholderTextColor="#6B7280"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <View style={styles.switchLabelContainer}>
                                    <View style={styles.row}>
                                        <Ionicons
                                            name={isPublic ? "earth" : "lock-closed"}
                                            size={20}
                                            color="#9CA3AF"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={styles.switchLabel}>
                                            {isPublic ? "Public List" : "Private List"}
                                        </Text>
                                    </View>
                                    <Text style={styles.switchSubtext}>
                                        {isPublic
                                            ? "Anyone can search or view this list."
                                            : "Only you can see this list."}
                                    </Text>
                                </View>
                                <Switch
                                    value={isPublic}
                                    onValueChange={setIsPublic}
                                    trackColor={{ false: "#374151", true: "#3B82F6" }}
                                    thumbColor={isPublic ? "#FFFFFF" : "#9CA3AF"}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={[styles.button, styles.cancelButton]}
                                disabled={loading}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                style={[styles.button, styles.createButton]}
                                disabled={loading || !title.trim()}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.createText}>Create List</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    keyboardWrapper: {
        width: "100%",
        alignItems: "center",
    },
    container: {
        width: "90%",
        maxWidth: 400,
        backgroundColor: "#111827",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "#1F2937",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#F9FAFB",
        marginBottom: 20,
        textAlign: "center",
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#D1D5DB",
    },
    input: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 12,
        color: "#F9FAFB",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1F2937",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#374151",
        marginTop: 8,
    },
    switchLabelContainer: {
        flex: 1,
        paddingRight: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F9FAFB",
    },
    switchSubtext: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: "#374151",
    },
    cancelText: {
        color: "#D1D5DB",
        fontWeight: "600",
        fontSize: 16,
    },
    createButton: {
        backgroundColor: "#3B82F6",
    },
    createText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
});
