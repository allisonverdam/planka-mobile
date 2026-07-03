// Planka Mobile — Users API

import { apiClient } from './client';
import type { User } from '@/types/models';

export async function getUser(userId: string): Promise<User> {
  const response = await apiClient.get<{ item: User }>(`/users/${userId}`);
  return response.data.item;
}
