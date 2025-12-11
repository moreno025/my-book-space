import React, { useContext, useState } from "react";
import { Text, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { registerSchema } from "../../schemas/auth";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { authApi } from "../../constants/api";
import { useAppFonts } from "../../hooks/useFonts";

export default function Register() {
    const router = useRouter();
    const fontsLoaded = useAppFonts();
    const { login } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, setError, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: "", email: "", password: "" },
    });

    const onSubmit = async (data: any) => {
        try {
            const res = await authApi.register(data);
            if (res.status === 201) {
                login(data.email, data.password);
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Ha ocurrido un error";
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                <Text style={styles.title}>My Book Space</Text>

                {/* Username */}
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Username"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
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
                            placeholder="Email"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
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
                            placeholder="Contraseña"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            secureTextEntry={!showPassword}
                            error={errors.password?.message}
                        />
                    )}
                />

                <Button title="Registrarse" onPress={handleSubmit(onSubmit)} />

                <Text style={styles.link} onPress={() => router.push("../login")}>
                    ¿Ya tienes cuenta? Inicia sesión
                </Text>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        paddingTop: 60,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    title: {
        fontSize: 36,
        marginBottom: 64,
        fontFamily: "PlaywrightNorge-Regular",
        textAlign: "center",
        color: "#fff",
    },
    link: {
        color: "#c7dcf3ff",
        marginTop: 12,
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
});
