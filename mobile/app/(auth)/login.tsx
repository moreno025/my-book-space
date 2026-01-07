import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, ImageBackground, StyleSheet, View, useWindowDimensions } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { loginSchema } from "../../schemas/auth";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { authApi } from "../../constants/api/index";
import { useAppFonts } from "../../hooks/useFonts";

export default function Login() {
    const { t } = useTranslation();
    const { height } = useWindowDimensions();
    const router = useRouter();
    const fontsLoaded = useAppFonts();
    const { login } = useContext(AuthContext);

    const { control, handleSubmit, setError, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: any) => {
        try {
            const res = await authApi.login(data.email, data.password);
            if (res.status === 200) {
                login(data.email, data.password);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || t('auth.errors.invalid_credentials');
            setError("email", { message: msg });
            setError("password", { message: msg });
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
                extraScrollHeight={100} // Extra offset to push content up
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={[styles.innerContainer, { minHeight: height }]}>
                    <Text style={styles.title}>{t('home.app_title')}</Text>

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
                                error={errors.email?.message || errors.root?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                placeholder={t('auth.password')}
                                secureTextEntry
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                error={errors.password?.message || errors.root?.message}
                            />
                        )}
                    />

                    <Button title={t('auth.iniciar_sesion')} onPress={handleSubmit(onSubmit)} />

                    <View style={styles.linksContainer}>
                        <Text style={styles.link} onPress={() => router.push("../register")}>
                            {t('auth.no_account')}
                        </Text>

                        <Text style={styles.link} onPress={() => router.push("../forgot-password")}>
                            {t('auth.forgot_password')}
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
        backgroundColor: "rgba(0,0,0,0.3)",
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
