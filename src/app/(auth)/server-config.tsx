// Planka Mobile — Server Configuration Screen

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { apiClient, removeStoredToken, setBaseUrl } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { borderRadius, spacing } from '@/theme';
import { typography } from '@/theme/typography';

export default function ServerConfigScreen() {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const setServerUrl = useSettingsStore((s) => s.setServerUrl);

  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleConnect = async () => {
    // Validate URL format
    let cleanUrl = url.trim();
    if (!cleanUrl) return;

    // Add https:// if not present
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/+$/, '');

    setIsChecking(true);
    try {
      // Clear any stored stale token
      await removeStoredToken();

      // Test connection by fetching config
      setBaseUrl(cleanUrl);
      await apiClient.get('/config', {
        timeout: 8000,
        headers: { 'X-Skip-Auth': 'true' } as any,
      });

      // Connection successful — save URL
      setServerUrl(cleanUrl);
      router.replace('/(auth)/login');
    } catch (e: any) {
      // If we get 401 Unauthorized, it means the server was successfully reached,
      // but it requires authentication (expected on some Planka instances).
      if (e.response?.status === 401) {
        setServerUrl(cleanUrl);
        router.replace('/(auth)/login');
      } else {
        Alert.alert(
          t('common.error'),
          t('auth.connectionError'),
          [{ text: 'OK' }]
        );
        console.log(e);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo / Header */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: brand.primary }]}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }, typography.displayMedium]}>
            Planka
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
            {t('auth.serverUrlHint')}
          </Text>
        </Animated.View>

        {/* URL Input */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }, typography.captionMedium]}>
            {t('auth.serverUrl')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
              typography.bodyLarge,
            ]}
            placeholder={t('auth.serverUrlPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleConnect}
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: brand.primary,
                opacity: !url.trim() || isChecking ? 0.5 : 1,
              },
            ]}
            onPress={handleConnect}
            disabled={!url.trim() || isChecking}
            activeOpacity={0.8}
          >
            {isChecking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, typography.button]}>
                {t('auth.connect')}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    marginLeft: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    height: 52,
  },
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#fff',
  },
});
