import { useState, useEffect } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Keyboard
} from "react-native";
import { ReviewForm } from "./ReviewForm";

interface ReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { rating: number; review: string }) => void;
    loading?: boolean;
    initialRating?: number;
    initialReview?: string;
}

export function ReviewModal({
    visible,
    onClose,
    onSubmit,
    loading,
    initialRating = 0,
    initialReview = "",
}: ReviewModalProps) {
    const [rating, setRating] = useState(initialRating);
    const [review, setReview] = useState(initialReview);

    useEffect(() => {
        if (visible) {
            setRating(initialRating);
            setReview(initialReview);
        } else {
            setRating(0);
            setReview("");
        }
    }, [visible, initialRating, initialReview]);

    const canSubmit = rating > 0 && review.trim().length > 0;

    const handleClose = () => {
        onClose();
    };

    const isEditing = initialRating > 0;

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
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                >
                    <View style={styles.container} onStartShouldSetResponder={() => true}>
                        <View style={styles.scrollWrapper}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContent}
                            >
                                <ReviewForm
                                    rating={rating}
                                    setRating={setRating}
                                    review={review}
                                    setReview={setReview}
                                />
                            </ScrollView>
                        </View>

                        {/* FIXED FOOTER */}
                        <View style={styles.footer}>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={handleClose}
                                    disabled={loading}
                                    style={[styles.button, styles.cancelButton]}
                                >
                                    <Text style={styles.cancelButtonText}>Close</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.submitButton,
                                        (!canSubmit || loading) && styles.submitDisabled
                                    ]}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        onSubmit({ rating, review });
                                    }}
                                    disabled={!canSubmit || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {isEditing ? "Update Review" : "Post Review"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
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
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    keyboardWrapper: {
        width: "94%",
        maxWidth: 440,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        padding: 24,
        paddingBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        maxHeight: "80%",
    },
    scrollWrapper: {
        flexShrink: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 16,
        marginTop: 8,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    cancelButtonText: {
        color: "#4B5563",
        fontWeight: "700",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: "#111827",
    },
    submitDisabled: {
        backgroundColor: "#E5E7EB",
    },
    submitText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
});