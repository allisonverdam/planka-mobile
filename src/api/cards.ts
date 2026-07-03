// Planka Mobile — Cards API

import { apiClient } from './client';
import type { Card, CardDetailData } from '@/types/models';

export async function getCards(listId: string): Promise<{ items: Card[] }> {
  const response = await apiClient.get<{ items: Card[] }>(`/lists/${listId}/cards`);
  return response.data;
}

export async function getCard(cardId: string): Promise<CardDetailData> {
  const response = await apiClient.get<CardDetailData>(`/cards/${cardId}`);
  return response.data;
}

export async function createCard(
  listId: string,
  data: { name: string; position: number; type?: 'project' | 'story' }
): Promise<{ item: Card }> {
  const response = await apiClient.post<{ item: Card }>(
    `/lists/${listId}/cards`,
    data
  );
  return response.data;
}

export interface UpdateCardData {
  name?: string;
  description?: string | null;
  dueDate?: string | null;
  isDueCompleted?: boolean;
  stopwatch?: { startedAt: string | null; total: number } | null;
  position?: number;
  listId?: string;
  boardId?: string;
  coverAttachmentId?: string | null;
  isClosed?: boolean;
}

export async function updateCard(
  cardId: string,
  data: UpdateCardData
): Promise<{ item: Card }> {
  const response = await apiClient.patch<{ item: Card }>(`/cards/${cardId}`, data);
  return response.data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiClient.delete(`/cards/${cardId}`);
}

export async function duplicateCard(cardId: string): Promise<{ item: Card }> {
  const response = await apiClient.post<{ item: Card }>(`/cards/${cardId}/duplicate`);
  return response.data;
}

// Card Labels
export async function addLabelToCard(
  cardId: string,
  labelId: string
): Promise<{ item: { id: string; cardId: string; labelId: string } }> {
  const response = await apiClient.post(`/cards/${cardId}/card-labels`, { labelId });
  return response.data;
}

export async function removeLabelFromCard(
  cardId: string,
  labelId: string
): Promise<void> {
  await apiClient.delete(`/cards/${cardId}/card-labels/labelId:${labelId}`);
}

// Card Members
export async function addMemberToCard(
  cardId: string,
  userId: string
): Promise<{ item: { id: string; cardId: string; userId: string } }> {
  const response = await apiClient.post(`/cards/${cardId}/card-memberships`, { userId });
  return response.data;
}

export async function removeMemberFromCard(
  cardId: string,
  userId: string
): Promise<void> {
  await apiClient.delete(`/cards/${cardId}/card-memberships/userId:${userId}`);
}
