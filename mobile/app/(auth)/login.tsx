import React, { useContext } from "react";
import { Text, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { loginSchema } from "../../schemas/auth";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { authApi } from "../../constants/api";
import { useAppFonts } from "../../hooks/useFonts";

export default function Login() {
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
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Credenciales incorrectas.";
            // Asignar error genérico a ambos inputs
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                <Text style={styles.title}>My Book Space</Text>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Email"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            error={errors.email?.message || errors.root?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Contraseña"
                            secureTextEntry
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            error={errors.password?.message || errors.root?.message}
                        />
                    )}
                />

                <Button title="Iniciar sesión" onPress={handleSubmit(onSubmit)} />

                <Text style={styles.link} onPress={() => router.push("../register")}>
                    ¿No tienes cuenta? Regístrate
                </Text>

                <Text style={styles.link} onPress={() => router.push("../forgot-password")}>
                    ¿Olvidaste tu contraseña?
                </Text>
            </KeyboardAvoidingView>
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
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 36,
        marginBottom: 64,
        fontFamily: "PlaywrightNorge-Regular",
        textAlign: "center",
        color: "#fff",
    },
    link: {
        color: "#007AFF",
        marginTop: 12,
        textAlign: "center",
    },
});
