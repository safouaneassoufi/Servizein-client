import { apiClient } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (unread?: boolean) =>
    apiClient.get<any, Notification[]>('/notifications', { params: unread ? { unread: true } : {} }),

  getUnreadCount: () =>
    apiClient.get<any, { count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all'),
};
