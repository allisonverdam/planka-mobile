// Planka Mobile — Notifications Screen (Placeholder)

import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { typography } from '@/theme/typography';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, { color: colors.text }, typography.h1]}>
          {t('notifications.title')}
        </Text>
      </View>
      <View style={styles.emptyState}>
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>🔔</Text>
        <Text style={[{ color: colors.textSecondary }, typography.h3]}>
          {t('notifications.empty')}
        </Text>
        <Text style={[{ color: colors.textTertiary, marginTop: spacing.sm }, typography.body]}>
          {t('notifications.emptyDesc')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: {},
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
});
