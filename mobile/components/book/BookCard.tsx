import React from "react";
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BookCardProps = {
    id: string;
    coverUrl: string;
    rating?: number;
    onPress: (id: string) => void;
    width: number;
    readingStatus?: "not read" | "reading" | "read";
};

export function BookCard({
    id,
    coverUrl,
    rating,
    onPress,
    width,
    readingStatus,
}: BookCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(id)}
            style={[styles.container, { width }]}
        >
            <Image
                source={{ uri: coverUrl }}
                style={styles.cover}
                resizeMode="cover"
            />

            {readingStatus && readingStatus !== "not read" && (
                <View style={[styles.statusBadge,
                readingStatus === "read" ? styles.statusRead : styles.statusReading
                ]}>
                    <Ionicons
                        name={readingStatus === "read" ? "checkmark" : "book"}
                        size={12}
                        color="#FFF"
                    />
                </View>
            )}

            {rating !== undefined && rating > 0 && (
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    cover: {
        width: "100%",
        aspectRatio: 2 / 3,
        borderRadius: 12,
    },
    ratingContainer: {
        paddingVertical: 6,
        alignItems: "center",
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#F9FAFB",
    },
    statusBadge: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "rgba(0,0,0,0.2)",
    },
    statusRead: {
        backgroundColor: "#10B981",
    },
    statusReading: {
        backgroundColor: "#3B82F6",
    },
});
