import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface ListOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    listTitle: string;
    isPublic: boolean;
    onRename: () => void;
    onToggleVisibility: () => void;
    onDelete: () => void;
}

export function ListOptionsModal({
    visible,
    onClose,
    listTitle,
    isPublic,
    onRename,
    onToggleVisibility,
    onDelete,
}: ListOptionsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                </BlurView>
                <TouchableWithoutFeedback>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title} numberOfLines={1}>{listTitle}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    onRename();
                                    onClose();
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                                    <Ionicons name="create-outline" size={22} color="#10B981" />
                                </View>
                                <Text style={styles.optionText}>Rename List</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    onToggleVisibility();
                                    onClose();
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                                    <Ionicons
                                        name={isPublic ? "lock-closed-outline" : "globe-outline"}
                                        size={22}
                                        color="#3B82F6"
                                    />
                                </View>
                                <Text style={styles.optionText}>
                                    {isPublic ? "Make Private" : "Make Public"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, styles.lastOption]}
                                onPress={() => {
                                    onDelete();
                                    onClose();
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                </View>
                                <Text style={[styles.optionText, { color: "#EF4444" }]}>Delete List</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    backdrop: {
        flex: 1,
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
        flex: 1,
        marginRight: 10,
        fontFamily: "Nunito-Bold",
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        paddingVertical: 10,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    lastOption: {
        borderTopWidth: 1,
        borderTopColor: "#374151",
        marginTop: 5,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    optionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#E5E7EB",
        fontFamily: "Nunito-SemiBold",
    },
});
