// Planka Mobile — useTheme hook
// Returns the current theme colors based on user preference

import { useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getThemeColors, colors } from '@/theme/colors';
import type { ThemeColors, ThemeMode } from '@/theme/colors';

interface UseThemeResult {
  themeMode: ThemeMode;
  colors: ThemeColors;
  brand: typeof colors.brand;
  semantic: typeof colors.semantic;
  label: typeof colors.label;
  toggleTheme: () => void;
  isDark: boolean;
}

export function useTheme(): UseThemeResult {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  const themeColors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  return {
    themeMode,
    colors: themeColors,
    brand: colors.brand,
    semantic: colors.semantic,
    label: colors.label,
    toggleTheme,
    isDark: themeMode === 'dark',
  };
}
