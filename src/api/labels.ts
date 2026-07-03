// Planka Mobile — Labels API

import { apiClient } from './client';
import type { Label } from '@/types/models';

export async function createLabel(
  boardId: string,
  data: { name?: string; color: string; position: number }
): Promise<{ item: Label }> {
  const response = await apiClient.post<{ item: Label }>(
    `/boards/${boardId}/labels`,
    data
  );
  return response.data;
}

export async function updateLabel(
  labelId: string,
  data: Partial<Pick<Label, 'name' | 'color' | 'position'>>
): Promise<{ item: Label }> {
  const response = await apiClient.patch<{ item: Label }>(`/labels/${labelId}`, data);
  return response.data;
}

export async function deleteLabel(labelId: string): Promise<void> {
  await apiClient.delete(`/labels/${labelId}`);
}
