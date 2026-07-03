// Planka Mobile — Notifications API

import { apiClient } from './client';
import type { Notification } from '@/types/models';

export async function getNotifications(): Promise<{ items: Notification[] }> {
  const response = await apiClient.get<{ items: Notification[] }>('/notifications');
  return response.data;
}

export async function getNotification(
  notificationId: string
): Promise<{ item: Notification }> {
  const response = await apiClient.get<{ item: Notification }>(
    `/notifications/${notificationId}`
  );
  return response.data;
}

export async function updateNotification(
  notificationId: string,
  data: { isRead: boolean }
): Promise<{ item: Notification }> {
  const response = await apiClient.patch<{ item: Notification }>(
    `/notifications/${notificationId}`,
    data
  );
  return response.data;
}

export async function readAllNotifications(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}
