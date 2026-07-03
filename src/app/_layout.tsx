// Planka Mobile — Root Layout
// Handles font loading, splash screen, i18n, auth routing, and theme provider

import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { setBaseUrl } from '@/api/client';
import '@/i18n';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const themeMode = useSettingsStore((s) => s.themeMode);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const isConfigured = useSettingsStore((s) => s.isConfigured);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      // Load persisted settings
      await loadSettings();
      setAppReady(true);
    }
    prepare();
  }, [loadSettings]);

  useEffect(() => {
    async function initAuth() {
      if (appReady) {
        if (isConfigured && serverUrl) {
          setBaseUrl(serverUrl);
          await checkAuth(serverUrl);
        }
        setAuthChecked(true);
      }
    }
    initAuth();
  }, [appReady, isConfigured, serverUrl, checkAuth]);

  // Handle routing updates dynamically based on config and authentication state
  useEffect(() => {
    if (!appReady || !fontsLoaded || !authChecked) return;

    if (!isConfigured) {
      router.replace('/(auth)/server-config');
    } else if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(main)/(tabs)/projects');
    }
  }, [appReady, fontsLoaded, authChecked, isConfigured, isAuthenticated]);

  useEffect(() => {
    if (appReady && fontsLoaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded, authChecked]);

  if (!appReady || !fontsLoaded || !authChecked) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
