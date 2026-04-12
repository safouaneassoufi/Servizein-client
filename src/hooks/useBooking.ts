import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings.api';
import { availabilityApi } from '../api/availability.api';
import { useBookingStore } from '../store/booking.store';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getOne(id),
    enabled: !!id,
  });
}

export function useMonthlyAvailability(providerId: string, year: number, month: number) {
  return useQuery({
    queryKey: ['availability', 'monthly', providerId, year, month],
    queryFn: () => availabilityApi.getMonthly(providerId, year, month),
    enabled: !!providerId,
  });
}

export function useDailySlots(providerId: string, date: string | null) {
  return useQuery({
    queryKey: ['availability', 'daily', providerId, date],
    queryFn: () => availabilityApi.getDaily(providerId, date!),
    enabled: !!providerId && !!date,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { reset } = useBookingStore();

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      reset();
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
