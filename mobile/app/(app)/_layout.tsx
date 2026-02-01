
import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="book/[id]"
                options={{
                    presentation: 'card',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="settings"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="follow-requests"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="club/create"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_bottom',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="club/[id]"
                options={{
                    presentation: 'card',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
