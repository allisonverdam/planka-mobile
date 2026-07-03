// Planka Mobile — Login Screen

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { removeStoredToken } from '@/api/client';
import { spacing, borderRadius } from '@/theme';
import { typography } from '@/theme/typography';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const setServerUrl = useSettingsStore((s) => s.setServerUrl);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    try {
      await login(email.trim(), password);
      router.replace('/(main)/(tabs)/projects');
    } catch {
      // Error is handled by the store
    }
  };

  const handleChangeServer = async () => {
    setServerUrl('');
    await removeStoredToken();
    router.replace('/(auth)/server-config');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: brand.primary }]}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }, typography.displayMedium]}>
            Planka
          </Text>
          <TouchableOpacity onPress={handleChangeServer}>
            <Text style={[styles.serverUrl, { color: colors.textTertiary }, typography.caption]}>
              {serverUrl}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Form */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(244,67,54,0.1)', borderColor: 'rgba(244,67,54,0.3)' }]}>
              <Text style={[styles.errorText, { color: '#F44336' }, typography.caption]}>
                {t('auth.loginError')}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.textSecondary }, typography.captionMedium]}>
            {t('auth.email')}
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
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: colors.textSecondary }, typography.captionMedium]}>
            {t('auth.password')}
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
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: brand.primary,
                opacity: !email.trim() || !password.trim() || isLoading ? 0.5 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={!email.trim() || !password.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, typography.button]}>
                {t('auth.loginButton')}
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
    marginBottom: spacing['4xl'],
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
    marginBottom: spacing.xs,
  },
  serverUrl: {
    textDecorationLine: 'underline',
  },
  form: {
    gap: spacing.md,
  },
  label: {
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
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
    marginTop: spacing.lg,
  },
  buttonText: {
    color: '#fff',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
});
