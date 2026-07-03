// Planka Mobile — Lists API

import { apiClient } from './client';
import type { List } from '@/types/models';

export async function getList(listId: string): Promise<{ item: List }> {
  const response = await apiClient.get<{ item: List }>(`/lists/${listId}`);
  return response.data;
}

export async function createList(
  boardId: string,
  data: { name: string; position: number }
): Promise<{ item: List }> {
  const response = await apiClient.post<{ item: List }>(
    `/boards/${boardId}/lists`,
    data
  );
  return response.data;
}

export async function updateList(
  listId: string,
  data: Partial<Pick<List, 'name' | 'position'>>
): Promise<{ item: List }> {
  const response = await apiClient.patch<{ item: List }>(`/lists/${listId}`, data);
  return response.data;
}

export async function deleteList(listId: string): Promise<void> {
  await apiClient.delete(`/lists/${listId}`);
}

export async function sortList(
  listId: string,
  data: { type: 'name' | 'dueDate' | 'createdAt' }
): Promise<void> {
  await apiClient.post(`/lists/${listId}/sort`, data);
}

export async function clearList(listId: string): Promise<void> {
  await apiClient.post(`/lists/${listId}/clear`);
}

export async function moveCards(
  listId: string,
  data: { listId: string }
): Promise<void> {
  await apiClient.post(`/lists/${listId}/move-cards`, data);
}
