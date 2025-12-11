import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function AuthLayout() {
    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerShown: false, // Oculta headers de navegación en auth
                }}
            >
                <Stack.Screen name="login" options={{ title: "Inicio" }} />
                <Stack.Screen name="register" options={{ title: "Perfil" }} />
                <Stack.Screen name="forgot-password" options={{ title: "Ajustes" }} />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", // Fondo general para auth
        justifyContent: "center",
    },
});
