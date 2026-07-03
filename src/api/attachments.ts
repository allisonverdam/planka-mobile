// Planka Mobile — Attachments API

import type { Attachment } from '@/types/models';
import { apiClient } from './client';

export async function createAttachment(
  cardId: string,
  formData: FormData
): Promise<{ item: Attachment }> {
  const response = await apiClient.post<{ item: Attachment }>(
    `/cards/${cardId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function updateAttachment(
  attachmentId: string,
  data: Partial<Pick<Attachment, 'name'>>
): Promise<{ item: Attachment }> {
  const response = await apiClient.patch<{ item: Attachment }>(
    `/attachments/${attachmentId}`,
    data
  );
  return response.data;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient.delete(`/attachments/${attachmentId}`);
}
