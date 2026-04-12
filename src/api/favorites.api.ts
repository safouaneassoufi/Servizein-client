import { apiClient } from './client';

export interface FavoriteProvider {
  id: string;
  userId: string;
  providerId: string;
  createdAt: string;
  provider: {
    id: string;
    averageRating: number;
    reviewCount: number;
    city?: string;
    available: boolean;
    verified: boolean;
    user: { name: string; avatarUrl?: string };
  };
}

export const favoritesApi = {
  getAll: () => apiClient.get<any, FavoriteProvider[]>('/favorites'),

  toggle: (providerId: string) =>
    apiClient.post<any, { favorited: boolean }>(`/favorites/${providerId}`),

  getStatus: (providerId: string) =>
    apiClient.get<any, { favorited: boolean }>(`/favorites/${providerId}/status`),

  remove: (providerId: string) =>
    apiClient.delete<any, { favorited: boolean }>(`/favorites/${providerId}`),
};
