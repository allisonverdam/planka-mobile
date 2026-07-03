// Planka Mobile — Comments API

import { apiClient } from './client';
import type { Comment } from '@/types/models';

export async function getComments(cardId: string): Promise<{ items: Comment[] }> {
  const response = await apiClient.get<{ items: Comment[] }>(
    `/cards/${cardId}/comments`
  );
  return response.data;
}

export async function createComment(
  cardId: string,
  data: { text: string }
): Promise<{ item: Comment }> {
  const response = await apiClient.post<{ item: Comment }>(
    `/cards/${cardId}/comments`,
    data
  );
  return response.data;
}

export async function updateComment(
  commentId: string,
  data: { text: string }
): Promise<{ item: Comment }> {
  const response = await apiClient.patch<{ item: Comment }>(
    `/comments/${commentId}`,
    data
  );
  return response.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}
