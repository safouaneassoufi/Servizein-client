import { apiClient } from './client';
import type { Provider } from '../types/provider.types';
import type { PaginatedResponse } from '../types/api.types';

export const providersApi = {
  getAll: (params?: {
    categoryId?: string;
    city?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }) => apiClient.get<any, PaginatedResponse<Provider>>('/providers', { params }),

  getOne: (id: string) => apiClient.get<any, Provider>(`/providers/${id}`),
};
