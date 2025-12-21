import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReviewFormProps {
    rating: number;
    setRating: (rating: number) => void;
    review: string;
    setReview: (review: string) => void;
}

export function ReviewForm({ rating, setRating, review, setReview }: ReviewFormProps) {
    return (
        <View style={styles.formContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Share your experience</Text>
                <Text style={styles.subtitle}>How was your reading? Your review helps others discover great books.</Text>
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
                        {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                    </Text>
                )}
            </View>

            <TextInput
                multiline
                placeholder="Write your thoughts here..."
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
