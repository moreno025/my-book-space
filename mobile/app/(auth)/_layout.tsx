import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000' }
            }}
        >
            <Stack.Screen name="login" options={{ title: "Inicio" }} />
            <Stack.Screen name="register" options={{ title: "Perfil" }} />
            <Stack.Screen name="forgot-password" options={{ title: "Ajustes" }} />
        </Stack>
    );
}
