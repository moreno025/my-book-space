import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Text, ImageBackground, StyleSheet, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { registerSchema } from "../../schemas/auth";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { authApi } from "../../constants/api/index";
import { useAppFonts } from "../../hooks/useFonts";

export default function Register() {
    const { t } = useTranslation();
    const { height } = useWindowDimensions();
    const router = useRouter();
    const fontsLoaded = useAppFonts();
    const { login } = useContext(AuthContext);

    const { control, handleSubmit, setError, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: "", email: "", password: "" },
    });

    const onSubmit = async (data: any) => {
        try {
            const res = await authApi.register(data);
            if (res.status === 201) {
                login(data.email, data.password);
                router.replace("/");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || t('common.error');
            setError("username", { message: msg });
            setError("email", { message: msg });
            setError("password", { message: msg });
            console.error("Error register:", msg);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <ImageBackground
            source={require("../../assets/images/auth-01.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={[styles.innerContainer, { minHeight: height }]}>
                    <Text style={styles.title}>{t('home.app_title')}</Text>

                    {/* Username */}
                    <Controller
                        control={control}
                        name="username"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder={t('auth.username')}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCorrect={false}
                                error={errors.username?.message}
                            />
                        )}
                    />

                    {/* Email */}
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder={t('auth.email')}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                autoCorrect={false}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    {/* Password */}
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder={t('auth.password')}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <Button title={t('auth.registrarse')} onPress={handleSubmit(onSubmit)} />

                    <View style={styles.linksContainer}>
                        <Text style={styles.link} onPress={() => router.push("../login")}>
                            {t('auth.already_have_account')}
                        </Text>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    scrollContent: {
        flexGrow: 1,
    },
    innerContainer: {
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 36,
        marginBottom: 64,
        fontFamily: "PlaywrightNorge-Regular",
        textAlign: "center",
        color: "#fff",
    },
    linksContainer: {
        marginTop: 16,
    },
    link: {
        color: "#c7dcf3ff",
        marginTop: 12,
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
});
