import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Skeleton } from "./Skeleton";

export function BookDetailSkeleton() {
    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Cover */}
            <View style={styles.coverContainer}>
                <Skeleton width={180} height={270} borderRadius={18} />
            </View>

            <View style={styles.content}>
                <Skeleton width="70%" height={28} />
                <Skeleton width="45%" height={18} style={{ marginTop: 8 }} />
                <Skeleton width="20%" height={14} style={{ marginTop: 6 }} />

                {/* Genres */}
                <View style={styles.row}>
                    <Skeleton width={80} height={28} borderRadius={20} />
                    <Skeleton width={100} height={28} borderRadius={20} />
                    <Skeleton width={90} height={28} borderRadius={20} />
                </View>

                {/* Metrics */}
                <View style={styles.metrics}>
                    <Skeleton width={90} height={80} borderRadius={14} />
                    <Skeleton width={90} height={80} borderRadius={14} />
                    <Skeleton width={90} height={80} borderRadius={14} />
                </View>

                {/* Description */}
                <View style={{ marginTop: 28 }}>
                    <Skeleton width="40%" height={18} />
                    <Skeleton width="100%" height={14} style={{ marginTop: 10 }} />
                    <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                    <Skeleton width="85%" height={14} style={{ marginTop: 8 }} />
                </View>

                {/* Stats */}
                <View style={styles.stats}>
                    <Skeleton width={60} height={30} />
                    <Skeleton width={60} height={30} />
                    <Skeleton width={60} height={30} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    coverContainer: {
        alignItems: "center",
        paddingTop: 20,
    },
    content: {
        padding: 20,
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    metrics: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 28,
    },
});
