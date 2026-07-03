// Planka Mobile — Tab Navigator Layout

import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme/typography';

// Simple tab icon component (we'll use text icons to avoid dependency on icon library for now)
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: any }) {
  const icons: Record<string, string> = {
    projects: '📋',
    notifications: '🔔',
    profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>
        {icons[name] ?? '📋'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          ...typography.label,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: t('projects.title'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="projects" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications.title'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="notifications" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
