// Planka Mobile — Boards API

import { apiClient } from './client';
import type { BoardDetailData, Board } from '@/types/models';

export async function getBoard(boardId: string): Promise<BoardDetailData> {
  const response = await apiClient.get<BoardDetailData>(`/boards/${boardId}`);
  return response.data;
}

export async function createBoard(
  projectId: string,
  data: { name: string; position: number }
): Promise<{ item: Board }> {
  const response = await apiClient.post<{ item: Board }>(
    `/projects/${projectId}/boards`,
    data
  );
  return response.data;
}

export async function updateBoard(
  boardId: string,
  data: Partial<Pick<Board, 'name' | 'position' | 'defaultView' | 'defaultCardType'>>
): Promise<{ item: Board }> {
  const response = await apiClient.patch<{ item: Board }>(`/boards/${boardId}`, data);
  return response.data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await apiClient.delete(`/boards/${boardId}`);
}
