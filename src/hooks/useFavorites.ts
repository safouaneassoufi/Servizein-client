import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api/favorites.api';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll(),
  });
}

export function useFavoriteStatus(providerId: string) {
  return useQuery({
    queryKey: ['favorites', providerId, 'status'],
    queryFn: () => favoritesApi.getStatus(providerId),
    enabled: !!providerId,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) => favoritesApi.toggle(providerId),
    onSuccess: (_data, providerId) => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['favorites', providerId, 'status'] });
    },
  });
}
