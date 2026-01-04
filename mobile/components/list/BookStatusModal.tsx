import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface BookStatusModalProps {
    visible: boolean;
    onClose: () => void;
    currentStatus: "not read" | "reading" | "read";
    bookTitle: string;
    onStatusChange: (status: "not read" | "reading" | "read") => void;
}

const statuses = [
    {
        value: "not read",
        label: "Not Read",
        icon: "book-outline",
        color: "#94A3B8",
        bgColor: "rgba(148, 163, 184, 0.15)",
    },
    {
        value: "reading",
        label: "Reading",
        icon: "book",
        color: "#3B82F6",
        bgColor: "rgba(59, 130, 246, 0.15)",
    },
    {
        value: "read",
        label: "Read",
        icon: "checkmark-circle",
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.15)",
    },
] as const;

export function BookStatusModal({
    visible,
    onClose,
    currentStatus,
    bookTitle,
    onStatusChange,
}: BookStatusModalProps) {

    const handleStatusSelect = (status: "not read" | "reading" | "read") => {
        onStatusChange(status);
        onClose();
    };

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

                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <Text style={styles.title} numberOfLines={2}>
                            {bookTitle}
                        </Text>
                        <Text style={styles.subtitle}>Update Reading Status</Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        {statuses.map((status) => {
                            const isSelected = currentStatus === status.value;
                            return (
                                <TouchableOpacity
                                    key={status.value}
                                    style={[
                                        styles.statusOption,
                                        { marginBottom: 12 },
                                        isSelected && {
                                            borderColor: status.color,
                                            backgroundColor: status.bgColor,
                                        },
                                    ]}
                                    onPress={() => handleStatusSelect(status.value)}
                                >
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            { backgroundColor: status.bgColor },
                                        ]}
                                    >
                                        <Ionicons
                                            name={status.icon as any}
                                            size={28}
                                            color={status.color}
                                        />
                                    </View>
                                    <View style={styles.statusTextContainer}>
                                        <Text style={styles.statusLabel}>{status.label}</Text>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color={status.color}
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        flex: 1,
    },
    container: {
        backgroundColor: "#111827",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#374151",
        borderRadius: 2,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        textAlign: "center",
        marginBottom: 6,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Nunito-Medium",
        color: "#94A3B8",
    },
    optionsContainer: {
        marginBottom: 20,
    },
    statusOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    statusTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusLabel: {
        fontSize: 17,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
    },
    cancelButton: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    cancelText: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#94A3B8",
    },
});
