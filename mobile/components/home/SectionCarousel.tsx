import React from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.28;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface SectionCarouselProps {
    title: string;
    books: any[];
}

export function SectionCarousel({ title, books }: SectionCarouselProps) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <FlatList
                data={books}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id || item.googleBookId}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push({
                                pathname: "/book/[id]",
                                params: { id: item.id || item.googleBookId },
                            })
                        }
                    >
                        <Image
                            source={{ uri: item.coverUrl || item.thumbnail }}
                            style={styles.cover}
                            resizeMode="cover"
                        />
                        <Text numberOfLines={1} style={styles.bookTitle}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: "Nunito-Bold",
        color: "#F9FAFB",
        marginHorizontal: 20,
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 12,
    },
    card: {
        width: CARD_WIDTH,
        marginHorizontal: 8,
    },
    cover: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        backgroundColor: "#1F2937",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    bookTitle: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: "Nunito-Bold",
        color: "#F3F4F6",
        textAlign: "center",
        paddingHorizontal: 4,
    },
});
