import React, { useEffect, useRef, useCallback } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
    onHide: () => void;
}

const { width } = Dimensions.get("window");

export function Toast({ message, type, visible, onHide }: ToastProps) {
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const translateX = useRef(new Animated.Value(20)).current;

    const hide = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 10,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 10,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    }, [opacity, translateY, translateX, onHide]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(translateX, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible, opacity, translateY, translateX, hide]);

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case "success": return "checkmark-circle";
            case "error": return "alert-circle";
            case "info": return "information-circle";
        }
    };

    const getColor = () => {
        switch (type) {
            case "success": return "#10B981";
            case "error": return "#EF4444";
            case "info": return "#3B82F6";
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }, { translateX }],
                    bottom: insets.bottom + 20,
                    backgroundColor: getColor(),
                },
            ]}
        >
            <Ionicons name={getIcon()} size={20} color="#FFF" />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        maxWidth: width - 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 9999,
    },
    text: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 14,
        marginLeft: 8,
    },
});
