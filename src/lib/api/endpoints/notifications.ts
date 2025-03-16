import { Notification } from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get notifications list
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>('/_/notifications/');
  return response.data;
};

/**
 * Get notification by ID
 */
export const getNotification = async (id: string): Promise<Notification> => {
  const response = await apiClient.get<Notification>(`/_/notifications/${id}/`);
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.patch<Notification>(`/_/notifications/${id}/`, { read: true });
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<Notification> => {
  const response = await apiClient.post<Notification>('/_/notifications/read_all/', {});
  return response.data;
};