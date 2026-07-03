// Planka Mobile — Initial Redirect Component

import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const isConfigured = useSettingsStore((s) => s.isConfigured);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isConfigured) {
    return <Redirect href="/(auth)/server-config" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(main)/(tabs)/projects" />;
}
