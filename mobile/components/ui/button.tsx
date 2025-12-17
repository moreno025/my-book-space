import React from "react";
import { TouchableOpacity, Text, StyleProp, ViewStyle } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export const Button = ({ title, onPress, style, disabled }: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
            {
                backgroundColor: "#da6c12ff",
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 16,
                opacity: disabled ? 0.5 : 1,
            },
            style,
        ]}
    >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
);
