import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Inicio" }} />
      <Stack.Screen name="profile" options={{ title: "Perfil" }} />
      <Stack.Screen name="settings" options={{ title: "Ajustes" }} />
    </Stack>
  );
}
