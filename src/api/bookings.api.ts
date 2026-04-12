import { apiClient } from './client';
import type { Booking } from '../types/booking.types';

export const bookingsApi = {
  create: (data: {
    providerId: string;
    serviceId: string;
    addressId: string;
    scheduledDate: string;
    scheduledSlot: string;
    clientNote?: string;
    paymentMethod?: 'CASH' | 'CARD_ON_SITE';
  }) => apiClient.post<any, Booking>('/bookings', data),

  getAll: () => apiClient.get<any, Booking[]>('/bookings'),

  getOne: (id: string) => apiClient.get<any, Booking>(`/bookings/${id}`),

  cancel: (id: string, reason?: string) =>
    apiClient.patch<any, Booking>(`/bookings/${id}/cancel`, { reason }),
};
