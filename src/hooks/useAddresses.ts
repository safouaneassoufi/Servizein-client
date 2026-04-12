import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '../api/addresses.api';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.getAll,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useAddressAutocomplete() {
  return (query: string) => addressesApi.autocomplete(query);
}
