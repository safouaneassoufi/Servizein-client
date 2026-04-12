import { useQuery } from '@tanstack/react-query';
import { providersApi } from '../api/providers.api';

export function useProviders(params?: {
  categoryId?: string;
  city?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => providersApi.getAll(params),
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providersApi.getOne(id),
    enabled: !!id,
  });
}
