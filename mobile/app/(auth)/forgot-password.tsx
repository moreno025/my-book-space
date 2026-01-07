import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    StyleSheet,
    Text,
    ImageBackground,
    Platform,
    View,
    ScrollView,
    KeyboardAvoidingView
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { authApi } from "../../constants/api/index";
import { forgotPasswordSchema } from "../../schemas/auth";
import { useAppFonts } from "../../hooks/useFonts";

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
    const [loading, setLoading] = useState(false);
    const fontsLoaded = useAppFonts();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        setMessage(null);
        setMessageType(null);

        try {
            const res = await authApi.forgotPassword(data.email);
            setMessage(res.data.message);
            setMessageType("success");
        } catch (err: any) {
            console.error(err.response?.data?.message || err.message);
            setMessage(err.response?.data?.message || t('auth.errors.reset_link_error'));
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) return null;

    const inputBorderColor =
        messageType === "success"
            ? "#4CAF50"
            : messageType === "error"
                ? "#FF5252"
                : "#000";

    return (
        <ImageBackground
            source={require("../../assets/images/auth-01.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={40} tint="dark" style={styles.blur} />

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                    style={{ width: "100%" }}
                >
                    <View style={styles.card}>
                        <Text style={styles.title}>{t('auth.recovery_title')}</Text>

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    placeholder={t('auth.email')}
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={errors.email?.message || undefined}
                                    borderColor={inputBorderColor}
                                />
                            )}
                        />

                        {message && (
                            <Text
                                style={[
                                    styles.message,
                                    { color: messageType === "success" ? "#4CAF50" : "#FF5252" }
                                ]}
                            >
                                {message}
                            </Text>
                        )}

                        <Button
                            title={loading ? t('auth.sending') : t('auth.send_reset_link')}
                            onPress={handleSubmit(onSubmit)}
                        />
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.73)",
        padding: 22,
        borderRadius: 20,
        width: "100%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "black",
        fontFamily: "Nunito-Bold",
    },
    message: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "500",
    },
});
