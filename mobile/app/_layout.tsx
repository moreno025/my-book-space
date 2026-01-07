import { Stack, useRouter, useSegments } from 'expo-router';
import 'react-native-reanimated';
import '../i18n';
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ToastProvider>
  );
}

function AuthGate() {
  const { token, user, loading, logout } = useAuth();
  console.log("🚪 [AuthGate] Render State:", { hasToken: !!token, hasUser: !!user, loading });
  const router = useRouter();
  const segments = useSegments();
  const [pendingRoute, setPendingRoute] = useState<{ path: string, params?: any } | null>(null);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      const data = Linking.parse(url);

      if (data.path === 'reset-password' && data.queryParams?.token) {
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
      const route = pendingRoute;
      setPendingRoute(null);

      router.replace({
        pathname: route.path as any,
        params: route.params
      });
    }
  }, [token, pendingRoute, router]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // If no token and not in auth group, go to login
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // If has token but in auth group, go to app
      router.replace('/(app)/(tabs)/profile');
    }
  }, [token, segments, loading, router]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {token && user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
