import { apiClient } from './client';

export interface ServiceRequest {
  id: string;
  clientId: string;
  categoryId: string;
  description: string;
  photoUrls: string[];
  status: 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';
  city?: string;
  expiresAt?: string;
  createdAt: string;
  category: { id: string; name: string; icon?: string };
}

export const requestsApi = {
  create: (data: {
    categoryId: string;
    description: string;
    photoUrls?: string[];
    city?: string;
  }) => apiClient.post<any, ServiceRequest>('/requests', data),

  getAll: () => apiClient.get<any, ServiceRequest[]>('/requests'),

  getOne: (id: string) => apiClient.get<any, ServiceRequest>(`/requests/${id}`),

  cancel: (id: string) => apiClient.patch<any, ServiceRequest>(`/requests/${id}/cancel`),
};
