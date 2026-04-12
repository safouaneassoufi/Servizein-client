import { apiClient } from './client';
import type { Category, Service } from '../types/provider.types';

export const catalogApi = {
  getCategories: () => apiClient.get<any, Category[]>('/catalog/categories'),

  getServices: (params?: { categoryId?: string; priceType?: 'FIXED' | 'QUOTE' }) =>
    apiClient.get<any, Service[]>('/catalog/services', { params }),
};
