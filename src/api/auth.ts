// Planka Mobile — Auth API

import { apiClient, setStoredToken, removeStoredToken } from './client';

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  item: string; // The access token
}

export async function login(credentials: LoginRequest): Promise<string> {
  const response = await apiClient.post<LoginResponse>('/access-tokens', credentials);
  const token = response.data.item;
  await setStoredToken(token);
  return token;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.delete('/access-tokens/me');
  } finally {
    await removeStoredToken();
  }
}

export async function acceptTerms(): Promise<void> {
  await apiClient.post('/access-tokens/accept-terms');
}
