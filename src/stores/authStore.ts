// Planka Mobile — Auth Store
// Manages authentication state, login/logout, and bootstrap

import { login as apiLogin, logout as apiLogout } from '@/api/auth';
import { getBootstrap } from '@/api/bootstrap';
import { getStoredToken, setBaseUrl } from '@/api/client';
import { getUser } from '@/api/users';
import type { BootstrapData, User } from '@/types/models';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { useProjectStore } from './projectStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<BootstrapData | null>;
  checkAuth: (serverUrl: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: false,
  error: null,

  login: async (emailOrUsername: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiLogin({ emailOrUsername, password });
      // After login, run bootstrap to get user data
      await get().bootstrap();
      set({ isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message, isAuthenticated: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
      useProjectStore.getState().reset();
    }
  },

  bootstrap: async () => {
    set({ isBootstrapping: true });
    try {
      const data = await getBootstrap();
      console.log({data});

      const token = await getStoredToken();
      let currentUser: User | undefined = undefined;

      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const userId = decoded?.userId || decoded?.id || decoded?.sub;
          if (userId) {
            currentUser = await getUser(userId);
          }
        } catch (e) {
          console.warn('Failed to decode token or fetch user', e);
        }
      }
      
      set({
        user: currentUser ?? data.currentUser ?? data.user,
        isAuthenticated: !!token,
        isBootstrapping: false,
      });

      // Hydrate project store with bootstrap data
      useProjectStore.getState().hydrateFromBootstrap(data);

      return data;
    } catch (error) {
      set({ isBootstrapping: false });
      console.error('Bootstrap failed:', error);
      return null;
    }
  },

  checkAuth: async (serverUrl: string) => {
    setBaseUrl(serverUrl);
    const token = await getStoredToken();
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    // Try bootstrap to validate token
    const data = await get().bootstrap();
    if (data) {
      return true;
    }
    set({ isAuthenticated: false });
    return false;
  },

  clearError: () => set({ error: null }),
}));
