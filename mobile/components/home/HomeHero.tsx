import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = width * 1.2;

interface HomeHeroProps {
    book: any;
}

export function HomeHero({ book }: HomeHeroProps) {
    const router = useRouter();

    if (!book) return null;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: book.coverUrl || book.thumbnail }}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={["transparent", "rgba(11, 15, 25, 0.8)", "#0B0F19"]}
                style={styles.gradient}
            />

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {book.title}
                </Text>
                <Text style={styles.authors}>
                    {book.authors?.join(", ")}
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}
                    >
                        <Ionicons name="play" size={20} color="#0B0F19" />
                        <Text style={styles.primaryButtonText}>Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="add" size={24} color="#F9FAFB" />
                        <Text style={styles.secondaryButtonText}>My List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: HERO_HEIGHT,
        position: "relative",
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
    },
    content: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        textAlign: "center",
        marginBottom: 8,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    authors: {
        fontSize: 16,
        fontFamily: "Nunito-Medium",
        color: "#D1D5DB",
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#0B0F19",
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
    },
});
