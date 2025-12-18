import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Skeleton } from "./Skeleton";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 8 * 2 - 8 * 2) / 3; // mismo cálculo que el grid
const ITEM_HEIGHT = ITEM_WIDTH / 0.66;

export function BookGridSkeleton() {
    return (
        <View style={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={ITEM_WIDTH}
                    height={ITEM_HEIGHT}
                    borderRadius={12}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 8,
        paddingTop: 12,
        gap: 8,
        justifyContent: "space-between",
    },
});
