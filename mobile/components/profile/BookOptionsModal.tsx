import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface BookOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    bookTitle: string;
    onWriteReview?: () => void;
    onDelete?: () => void;
    currentStatus?: "not read" | "reading" | "read";
    onStatusChange?: (status: "not read" | "reading" | "read") => void;
}

const { height } = Dimensions.get('window');

export function BookOptionsModal({ visible, onClose, bookTitle, onWriteReview, onDelete, currentStatus, onStatusChange }: BookOptionsModalProps) {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.content}>
                        <View style={styles.indicator} />

                        <View style={styles.header}>
                            <Text numberOfLines={1} style={styles.headerTitle}>{bookTitle}</Text>
                        </View>

                        <View style={styles.optionsContainer}>
                            {onStatusChange && (
                                <View style={styles.statusContainer}>
                                    <Text style={styles.sectionTitle}>Reading Status</Text>
                                    <View style={styles.statusRow}>
                                        {(["not read", "reading", "read"] as const).map((status) => {
                                            const isActive = currentStatus === status;
                                            const config = {
                                                "not read": { label: "Not Read", icon: "book-outline", activeColor: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" },
                                                "reading": { label: "Reading", icon: "book", activeColor: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
                                                "read": { label: "Read", icon: "checkmark-circle", activeColor: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
                                            }[status];

                                            return (
                                                <TouchableOpacity
                                                    key={status}
                                                    style={[
                                                        styles.statusButton,
                                                        isActive && { backgroundColor: config.bg, borderColor: config.activeColor, borderWidth: 1 }
                                                    ]}
                                                    onPress={() => {
                                                        onStatusChange(status);
                                                        onClose();
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={config.icon as any}
                                                        size={16}
                                                        color={isActive ? config.activeColor : "#6B7280"}
                                                    />
                                                    <Text style={[
                                                        styles.statusButtonText,
                                                        isActive && { color: config.activeColor }
                                                    ]}>
                                                        {config.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            {onWriteReview && (
                                <TouchableOpacity
                                    style={[styles.option, { marginBottom: 12 }]}
                                    onPress={() => {
                                        onClose();
                                        onWriteReview();
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)', marginRight: 16 }]}>
                                        <Ionicons name="create-outline" size={22} color="#3B82F6" />
                                    </View>
                                    <Text style={styles.optionText}>Write a Review</Text>
                                </TouchableOpacity>
                            )}

                            {onDelete && (
                                <TouchableOpacity
                                    style={[styles.option, styles.deleteOption, { marginBottom: 12 }]}
                                    onPress={() => {
                                        onClose();
                                        onDelete();
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)', marginRight: 16 }]}>
                                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.optionText, styles.deleteText]}>Remove from List</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        backgroundColor: '#111827',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    content: {
        paddingHorizontal: 24,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: '#374151',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F9FAFB',
        fontFamily: 'Nunito-Bold',
    },
    optionsContainer: {
        marginBottom: 24,
    },
    statusContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 12,
        fontFamily: "Nunito-Bold",
        paddingHorizontal: 4,
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    statusButton: {
        flex: 1,
        height: 40,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        borderWidth: 1,
        borderColor: "transparent",
    },
    statusButtonText: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: "Nunito-Bold",
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 20,
    },
    deleteOption: {
        // Option specific styles if needed
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F3F4F6',
    },
    deleteText: {
        color: '#EF4444',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '600',
    },
});
