import React from "react";
import { TouchableOpacity, Text, StyleProp, ViewStyle } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

export const Button = ({ title, onPress, style }: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            {
                backgroundColor: "#da6c12ff",
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 16,
            },
            style,
        ]}
    >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
);
