import { apiClient } from './client';
import type { AvailabilityDay, TimeSlot } from '../types/booking.types';

export const availabilityApi = {
  getMonthly: (providerId: string, year: number, month: number) =>
    apiClient.get<any, { providerId: string; year: number; month: number; days: AvailabilityDay[] }>(
      `/availability/${providerId}/monthly`,
      { params: { year, month } }
    ),

  getDaily: (providerId: string, date: string) =>
    apiClient.get<any, { date: string; slots: TimeSlot[] }>(
      `/availability/${providerId}/daily`,
      { params: { date } }
    ),
};
