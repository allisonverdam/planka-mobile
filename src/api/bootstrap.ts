// Planka Mobile — Bootstrap API

import { apiClient } from './client';
import type { BootstrapData } from '@/types/models';

export async function getBootstrap(): Promise<BootstrapData> {
  const response = await apiClient.get<BootstrapData>('/bootstrap');
  return response.data;
}

export async function getConfig(): Promise<{ item: Record<string, unknown> }> {
  const response = await apiClient.get('/config');
  return response.data;
}

export async function getTerms(): Promise<{ item: string }> {
  const response = await apiClient.get('/terms');
  return response.data;
}
