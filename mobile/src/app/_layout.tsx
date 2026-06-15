import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10000,
    },
  },
});

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = segments[0] === 'index' || segments[0] === 'settings';

    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/');
    } else if (isAuthenticated && isAuthRoute && segments[0] !== 'settings') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}