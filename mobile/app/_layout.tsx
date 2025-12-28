import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
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

  useEffect(() => {
    if (loading) return;

    if (!token || !user) {

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 0);
    } else if (token && user) {
      // Redirect to home if authenticated and currently in auth group (optional but good for deep links)
      // This part is handled naturally by the user navigation usually, but good to ensure
    }
  }, [token, user, loading, router]);

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

  if (loading) return null;

  return (
    <Stack key={token && user ? 'authenticated' : 'unauthenticated'} screenOptions={{ headerShown: false }}>
      {token && user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
