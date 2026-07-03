// Planka Mobile — API Client
// Axios instance with dynamic base URL, Bearer token interceptors, and error handling

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'planka_auth_token';
const SERVER_URL_KEY = 'planka_server_url';

// Create axios instance with no base URL (set dynamically)
export const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Token Management ---

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// --- Server URL Management ---

export async function getStoredServerUrl(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SERVER_URL_KEY);
  } catch {
    return null;
  }
}

export async function setStoredServerUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(SERVER_URL_KEY, url);
}

// --- Set Base URL ---

export function setBaseUrl(serverUrl: string): void {
  // Remove trailing slash and append /api
  const cleanUrl = serverUrl.replace(/\/+$/, '');
  apiClient.defaults.baseURL = `${cleanUrl}/api`;
}

// --- Request Interceptor: Attach Bearer Token ---

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.headers && config.headers['X-Skip-Auth']) {
      delete config.headers['X-Skip-Auth'];
      return config;
    }
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor: Handle Errors ---

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored token
      await removeStoredToken();
      // The auth store will detect this and redirect to login
    }
    return Promise.reject(error);
  }
);

// --- API Error Helper ---

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    return {
      status: axiosError.response?.status ?? 0,
      message:
        axiosError.response?.data?.message ??
        axiosError.message ??
        'An unexpected error occurred',
      code: axiosError.response?.data?.code ?? axiosError.code,
    };
  }
  return {
    status: 0,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}
