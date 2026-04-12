import { apiClient } from './client';
import type { Address } from '../types/booking.types';

export const addressesApi = {
  getAll: () => apiClient.get<any, Address[]>('/addresses'),

  create: (data: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }) => apiClient.post<any, Address>('/addresses', data),

  update: (id: string, data: Partial<{
    label: string;
    line1: string;
    line2: string;
    city: string;
    isDefault: boolean;
  }>) => apiClient.put<any, Address>(`/addresses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/addresses/${id}`),

  autocomplete: (query: string) =>
    apiClient.get<any, { label: string; latitude: number; longitude: number }[]>(
      '/addresses/autocomplete',
      { params: { q: query } }
    ),
};
