import { Attachment } from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get attachments list
 */
export const getAttachments = async (): Promise<Attachment[]> => {
  const response = await apiClient.get<Attachment[]>('/_/upload/');
  return response.data;
};

/**
 * Get attachment by ID
 */
export const getAttachment = async (id: string): Promise<Attachment> => {
  const response = await apiClient.get<Attachment>(`/_/upload/${id}/`);
  return response.data;
};

/**
 * Upload new attachment
 */
export const uploadAttachment = async (file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<Attachment>('/_/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Update attachment
 */
export const updateAttachment = async (id: string, data: Partial<Attachment>): Promise<Attachment> => {
  const response = await apiClient.put<Attachment>(`/_/upload/${id}/`, data);
  return response.data;
};

/**
 * Delete attachment
 */
export const deleteAttachment = async (id: string): Promise<void> => {
  await apiClient.delete(`/_/upload/${id}/`);
};