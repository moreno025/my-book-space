import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

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
  const { token, loading, logout } = useAuth();
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState<{ path: string, params?: any } | null>(null);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      const data = Linking.parse(url);

      if (data.path === 'reset-password' && data.queryParams?.token) {
        // Set pending route and logout
        setPendingRoute({
          path: '/(auth)/reset-password',
          params: { token: data.queryParams?.token as string }
        });
        await logout();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) handleDeepLink({ url: initial });
    })();

    return () => subscription.remove();
  }, [logout]);

  // Handle pending navigation once logged out
  useEffect(() => {
    if (!token && pendingRoute) {
      // Clear pending route before navigating to avoid loops
      const route = pendingRoute;
      setPendingRoute(null);

      // Navigate to the pending route
      router.replace({
        pathname: route.path as any,
        params: route.params
      });
    }
  }, [token, pendingRoute, router]);

  if (loading) return null;

  return (
    <Stack key={token ? 'authenticated' : 'unauthenticated'} screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
