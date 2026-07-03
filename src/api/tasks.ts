// Planka Mobile — Tasks API (Checklists)

import { apiClient } from './client';
import type { TaskList, Task } from '@/types/models';

// Task Lists
export async function createTaskList(
  cardId: string,
  data: { name: string; position: number }
): Promise<{ item: TaskList }> {
  const response = await apiClient.post<{ item: TaskList }>(
    `/cards/${cardId}/task-lists`,
    data
  );
  return response.data;
}

export async function getTaskList(
  taskListId: string
): Promise<{ item: TaskList; included: { tasks: Task[] } }> {
  const response = await apiClient.get(`/task-lists/${taskListId}`);
  return response.data;
}

export async function updateTaskList(
  taskListId: string,
  data: Partial<Pick<TaskList, 'name' | 'position'>>
): Promise<{ item: TaskList }> {
  const response = await apiClient.patch<{ item: TaskList }>(
    `/task-lists/${taskListId}`,
    data
  );
  return response.data;
}

export async function deleteTaskList(taskListId: string): Promise<void> {
  await apiClient.delete(`/task-lists/${taskListId}`);
}

// Tasks (individual checklist items)
export async function createTask(
  taskListId: string,
  data: { name: string; position: number }
): Promise<{ item: Task }> {
  const response = await apiClient.post<{ item: Task }>(
    `/task-lists/${taskListId}/tasks`,
    data
  );
  return response.data;
}

export async function updateTask(
  taskId: string,
  data: Partial<Pick<Task, 'name' | 'position' | 'isCompleted'>>
): Promise<{ item: Task }> {
  const response = await apiClient.patch<{ item: Task }>(`/tasks/${taskId}`, data);
  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
