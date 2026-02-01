import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim() || sending || disabled) return;

        try {
            setSending(true);
            await onSend(message.trim());
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#6B7280"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                editable={!disabled && !sending}
            />
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    (!message.trim() || sending || disabled) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim() || sending || disabled}
            >
                {sending ? (
                    <ActivityIndicator size="small" color="#F9FAFB" />
                ) : (
                    <Ionicons name="send" size={20} color="#F9FAFB" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#1F2937",
        borderTopWidth: 1,
        borderTopColor: "#374151",
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: "#0F172A",
        borderWidth: 1,
        borderColor: "#374151",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: "#F9FAFB",
        maxHeight: 100,
        fontFamily: "Nunito-Regular",
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#374151",
        opacity: 0.5,
    },
});
