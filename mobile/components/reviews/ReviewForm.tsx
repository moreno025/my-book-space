import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

interface ReviewFormProps {
    rating: number;
    setRating: (rating: number) => void;
    review: string;
    setReview: (review: string) => void;
}

export function ReviewForm({ rating, setRating, review, setReview }: ReviewFormProps) {
    const { t } = useTranslation();
    return (
        <View style={styles.formContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('review.form_title')}</Text>
                <Text style={styles.subtitle}>{t('review.form_subtitle')}</Text>
            </View>

            <View style={styles.ratingSection}>
                <View style={styles.starsWrapper}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            activeOpacity={0.7}
                            style={styles.starTouch}
                        >
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={32}
                                color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                {rating > 0 && (
                    <Text style={styles.ratingText}>
                        {rating === 5 ? t('review.ratings.excellent') : rating === 4 ? t('review.ratings.very_good') : rating === 3 ? t('review.ratings.good') : rating === 2 ? t('review.ratings.fair') : t('review.ratings.poor')}
                    </Text>
                )}
            </View>

            <TextInput
                multiline
                placeholder={t('review.placeholder')}
                placeholderTextColor="#9CA3AF"
                value={review}
                onChangeText={setReview}
                style={styles.input}
                maxLength={500}
            />
            <Text style={styles.charCount}>{review.length}/500</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        width: "100%",
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 18,
    },
    ratingSection: {
        alignItems: "center",
        marginBottom: 16,
    },
    starsWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    starTouch: {
        padding: 2,
    },
    ratingText: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
    },
    input: {
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        padding: 16,
        fontSize: 16,
        color: "#1F2937",
        minHeight: 100,
        textAlignVertical: "top",
    },
    charCount: {
        alignSelf: "flex-end",
        marginTop: 4,
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 4,
    },
});
