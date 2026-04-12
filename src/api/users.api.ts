import { apiClient } from './client';
import type { UserMe } from '../types/auth.types';

export const usersApi = {
  getMe: () => apiClient.get<any, UserMe>('/users/me'),

  updateMe: (data: { name?: string; email?: string; avatarUrl?: string }) =>
    apiClient.put<any, UserMe>('/users/me', data),
};
