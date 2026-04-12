import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '../api/requests.api';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsApi.getAll(),
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => requestsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requestsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useCancelRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requestsApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}
