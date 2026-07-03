// Planka Mobile — Color Tokens
// Inspired by the Planka web app with premium dark/light mode

export const colors = {
  // Brand
  brand: {
    primary: '#2196F3',
    primaryLight: '#64B5F6',
    primaryDark: '#1565C0',
    accent: '#00BCD4',
  },

  // Planka Label Colors
  label: {
    berryRed: '#e04f5f',
    pumpkinOrange: '#f0982d',
    lagoonBlue: '#2e80c7',
    pinkTulip: '#c36498',
    midnightBlue: '#455a75',
    peachYellow: '#e0c255',
    oceanGreen: '#4ea088',
    brightMoss: '#69b04b',
    lightConcrete: '#b3bac2',
    darkGranite: '#4d4d4d',
  },

  // Semantic
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Dark Theme
  dark: {
    background: '#0f1115',
    surface: '#1a1d23',
    surfaceElevated: '#252830',
    surfaceHover: '#2d3038',
    border: '#333740',
    borderLight: '#2a2d35',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#6b7280',
    textInverse: '#11181C',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Light Theme
  light: {
    background: '#f5f6f8',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceHover: '#f0f1f3',
    border: '#e1e3e6',
    borderLight: '#ebedf0',
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    textInverse: '#ECEDEE',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  overlay: string;
}

export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? colors.dark : colors.light;
};
