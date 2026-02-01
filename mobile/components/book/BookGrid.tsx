import React from "react";
import {
    FlatList,
    Dimensions,
    StyleSheet,
} from "react-native";
import { BookCard } from "./BookCard";

type Book = {
    id: string;
    coverUrl: string;
    rating?: number;
    readingStatus?: "not read" | "reading" | "read";
};

type BookGridProps = {
    books: Book[];
    onBookPress: (id: string) => void;
    contentContainerStyle?: any;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
    scrollEnabled?: boolean;
};

const { width } = Dimensions.get("window");
const NUM_COLUMNS = getNumColumns();
const ITEM_WIDTH = (width - 16 * 2 - 8 * (NUM_COLUMNS - 1)) / NUM_COLUMNS;


function getNumColumns() {
    if (width >= 768) return 4;
    return 3;
}

export function BookGrid({ books, onBookPress, contentContainerStyle, ListHeaderComponent, ListFooterComponent, scrollEnabled = true }: BookGridProps) {
    const numCols = getNumColumns();
    return (
        <FlatList
            key={numCols}
            data={books}
            keyExtractor={(item) => item.id}
            numColumns={numCols}
            contentContainerStyle={[styles.list, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            scrollEnabled={scrollEnabled}
            renderItem={({ item }) => (
                <BookCard
                    id={item.id}
                    coverUrl={item.coverUrl}
                    rating={item.rating}
                    onPress={onBookPress}
                    width={ITEM_WIDTH}
                    readingStatus={item.readingStatus}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 8,
        paddingTop: 12,
        paddingBottom: 24,
    },
});
