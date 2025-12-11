import React from "react";
import { Text, StyleSheet } from "react-native";

export const FormError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return <Text style={styles.error}>{message}</Text>;
};

const styles = StyleSheet.create({
    error: {
        color: "red",
        textAlign: "center",
        fontSize: 14
    },
});
