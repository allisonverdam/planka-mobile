// Planka Mobile — Profile Screen

import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { spacing, borderRadius } from '@/theme';
import { typography } from '@/theme/typography';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, brand, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const serverUrl = useSettingsStore((s) => s.serverUrl);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[{ color: colors.text }, typography.h1]}>
          {t('profile.title')}
        </Text>
      </View>

      {/* User Info */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: brand.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[{ color: colors.text }, typography.h3]}>{user?.name ?? 'User'}</Text>
          <Text style={[{ color: colors.textSecondary }, typography.caption]}>
            {user?.email ?? ''}
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.captionMedium]}>
          {t('profile.settings')}
        </Text>

        {/* Theme Toggle */}
        <View style={styles.settingRow}>
          <Text style={[{ color: colors.text }, typography.body]}>
            {t('profile.theme')}
          </Text>
          <View style={styles.themeToggle}>
            <Text style={[{ color: colors.textSecondary, marginRight: spacing.sm }, typography.caption]}>
              {isDark ? t('profile.darkMode') : t('profile.lightMode')}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: brand.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Server Info */}
        <View style={styles.settingRow}>
          <Text style={[{ color: colors.text }, typography.body]}>
            {t('profile.serverInfo')}
          </Text>
          <Text style={[{ color: colors.textTertiary }, typography.caption]} numberOfLines={1}>
            {serverUrl}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: '#F44336' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={[{ color: '#F44336' }, typography.buttonSmall]}>
          {t('auth.logout')}
        </Text>
      </TouchableOpacity>
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
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    gap: spacing['2xs'],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
});
