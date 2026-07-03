// Planka Mobile — Settings Store
// Manages server URL, theme mode, and language preferences

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@/theme/colors';

const SETTINGS_STORAGE_KEY = '@planka_settings';

interface SettingsState {
  serverUrl: string;
  themeMode: ThemeMode;
  language: string;
  isConfigured: boolean;

  // Actions
  setServerUrl: (url: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: string) => void;
  loadSettings: () => Promise<void>;
  persistSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  serverUrl: '',
  themeMode: 'dark',
  language: 'en',
  isConfigured: false,

  setServerUrl: (url: string) => {
    set({ serverUrl: url, isConfigured: url.length > 0 });
    get().persistSettings();
  },

  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
    get().persistSettings();
  },

  setLanguage: (language: string) => {
    set({ language });
    get().persistSettings();
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          serverUrl: parsed.serverUrl ?? '',
          themeMode: parsed.themeMode ?? 'dark',
          language: parsed.language ?? 'en',
          isConfigured: (parsed.serverUrl ?? '').length > 0,
        });
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  },

  persistSettings: async () => {
    try {
      const { serverUrl, themeMode, language } = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ serverUrl, themeMode, language })
      );
    } catch (error) {
      console.warn('Failed to persist settings:', error);
    }
  },
}));
