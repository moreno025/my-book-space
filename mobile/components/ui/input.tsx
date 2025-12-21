import React, { useState, useRef, useEffect } from "react";
import { TextInput, View, Text, TextInputProps, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    error?: string;
    secureTextEntry?: boolean;
    placeholderTextColor?: string;
    borderColor?: string;
}

export const Input = ({
    error,
    secureTextEntry,
    placeholderTextColor = "#555",
    borderColor,
    style,
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [error, shakeAnim]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
            <View>
                <TextInput
                    {...props}
                    secureTextEntry={secureTextEntry && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={placeholderTextColor} // ← ahora usa la prop
                    style={[
                        styles.input,
                        { borderColor: borderColor || (error ? "red" : isFocused ? "#007AFF" : "#000") },
                        style,
                    ]}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.showButton}
                    >
                        <Feather
                            name={showPassword ? "eye-off" : "eye"}
                            size={25}
                            color="black"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    input: {
        height: 60,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 18,
        backgroundColor: "#f7f7f7",
    },
    showButton: {
        position: "absolute",
        right: 20,
        top: 18,
    },
    errorText: {
        color: "red",
        marginTop: 4,
        fontSize: 14,
        fontWeight: "bold",
    },
});
