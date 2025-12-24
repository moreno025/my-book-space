import React from "react";
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";

type BookCardProps = {
    id: string;
    coverUrl: string;
    rating?: number;
    onPress: (id: string) => void;
    width: number;
};

export function BookCard({
    id,
    coverUrl,
    rating,
    onPress,
}: BookCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(id)}
            style={styles.container}
        >
            <Image
                source={{ uri: coverUrl }}
                style={styles.cover}
                resizeMode="cover"
            />

            {rating !== undefined && (
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 6,
        borderRadius: 12,
        backgroundColor: "#fff",
        overflow: 'hidden',

        // iOS 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,

        // Android
        elevation: 3,
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
    },
});
