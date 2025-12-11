import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { token, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
