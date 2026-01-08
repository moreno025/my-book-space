import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface CreateChallengeModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        goalBooks: number;
        startDate: string;
        endDate: string;
        presetType: 'year' | 'six_months' | 'custom';
    }) => void;
}

export function CreateChallengeModal({ visible, onClose, onSubmit }: CreateChallengeModalProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [goalBooks, setGoalBooks] = useState("12");
    const [range, setRange] = useState<'year' | 'six_months' | 'custom'>('year');
    const [customValue, setCustomValue] = useState("30");
    const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');

    const handlePresets = (type: 'year' | 'six_months' | 'custom') => {
        setRange(type);
        if (type === 'year') {
            setTitle(`Challenge ${new Date().getFullYear()}`);
        } else if (type === 'six_months') {
            setTitle("My 6-Month Challenge");
        } else {
            setTitle("");
        }
    };

    const handleSubmit = () => {
        const start = new Date();
        const end = new Date();

        if (range === 'year') {
            end.setFullYear(start.getFullYear() + 1);
        } else if (range === 'six_months') {
            end.setMonth(start.getMonth() + 6);
        } else {
            const val = parseInt(customValue) || 1;
            if (customUnit === 'days') end.setDate(start.getDate() + val);
            else if (customUnit === 'weeks') end.setDate(start.getDate() + (val * 7));
            else if (customUnit === 'months') end.setMonth(start.getMonth() + val);
        }

        onSubmit({
            title: title || t('challenges.title'),
            goalBooks: parseInt(goalBooks) || 1,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            presetType: range
        });

        // Reset state
        setTitle("");
        setGoalBooks("12");
        setRange('year');
        setCustomValue("30");
        setCustomUnit('days');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <BlurView intensity={50} tint="dark" style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.content}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{t('challenges.create_title')}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>{t('challenges.label_title')}</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Challenge 2026"
                                placeholderTextColor="#475569"
                            />

                            <Text style={styles.label}>{t('challenges.label_books')}</Text>
                            <TextInput
                                style={styles.input}
                                value={goalBooks}
                                onChangeText={setGoalBooks}
                                keyboardType="number-pad"
                                placeholder="12"
                                placeholderTextColor="#475569"
                            />

                            <Text style={styles.label}>{t('challenges.time_range')}</Text>
                            <View style={styles.rangeOptions}>
                                <TouchableOpacity
                                    style={[styles.rangeOption, range === 'year' && styles.rangeOptionActive]}
                                    onPress={() => handlePresets('year')}
                                >
                                    <Text style={[styles.rangeOptionText, range === 'year' && styles.rangeOptionTextActive]}>
                                        {t('challenges.range_year')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.rangeOption, range === 'six_months' && styles.rangeOptionActive]}
                                    onPress={() => handlePresets('six_months')}
                                >
                                    <Text style={[styles.rangeOptionText, range === 'six_months' && styles.rangeOptionTextActive]}>
                                        {t('challenges.range_six_months')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.rangeOption, range === 'custom' && styles.rangeOptionActive]}
                                    onPress={() => handlePresets('custom')}
                                >
                                    <Text style={[styles.rangeOptionText, range === 'custom' && styles.rangeOptionTextActive]}>
                                        {t('challenges.range_custom')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {range === 'custom' && (
                                <View style={styles.customDurationContainer}>
                                    <Text style={styles.label}>{t('challenges.label_duration')}</Text>
                                    <View style={styles.customRow}>
                                        <TextInput
                                            style={[styles.input, styles.customInput]}
                                            value={customValue}
                                            onChangeText={setCustomValue}
                                            keyboardType="number-pad"
                                        />
                                        <View style={styles.unitOptions}>
                                            {(['days', 'weeks', 'months'] as const).map((unit) => (
                                                <TouchableOpacity
                                                    key={unit}
                                                    style={[styles.unitButton, customUnit === unit && styles.unitButtonActive]}
                                                    onPress={() => setCustomUnit(unit)}
                                                >
                                                    <Text style={[styles.unitButtonText, customUnit === unit && styles.unitButtonTextActive]}>
                                                        {t(`challenges.unit_${unit}`)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>{t('common.confirm', 'Confirm')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    content: {
        backgroundColor: "#0F172A",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        maxHeight: "90%",
    },
    modalCard: {
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Nunito-Black",
        color: "#F1F5F9",
    },
    label: {
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#94A3B8",
        marginBottom: 10,
    },
    input: {
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 16,
        padding: 16,
        color: "#F1F5F9",
        fontFamily: "Nunito-Bold",
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    rangeOptions: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    rangeOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderWidth: 1,
        borderColor: "transparent",
    },
    rangeOptionActive: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
    },
    rangeOptionText: {
        color: "#64748B",
        fontFamily: "Nunito-Bold",
        fontSize: 13,
    },
    rangeOptionTextActive: {
        color: "#3B82F6",
    },
    customDurationContainer: {
        marginBottom: 24,
    },
    customRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    customInput: {
        flex: 1,
        marginBottom: 0,
    },
    unitOptions: {
        flex: 2,
        flexDirection: "row",
        gap: 4,
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: 12,
        padding: 4,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
    },
    unitButtonActive: {
        backgroundColor: "rgba(59, 130, 246, 0.15)",
    },
    unitButtonText: {
        fontSize: 11,
        fontFamily: "Nunito-Bold",
        color: "#64748B",
    },
    unitButtonTextActive: {
        color: "#3B82F6",
    },
    submitButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 16,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontFamily: "Nunito-Black",
        fontSize: 18,
    },
});
