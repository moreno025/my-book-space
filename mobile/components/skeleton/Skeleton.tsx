import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export function Skeleton({
    width,
    height,
    borderRadius = 8,
    style,
}: {
    width: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}) {
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, borderRadius, opacity },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: "#929497ff",
    },
});
