import type { Provider, Service } from './provider.types';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledSlot: string;
  originalPrice: number;
  finalPrice: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD_ON_SITE';
  clientNote: string | null;
  cancelReason: string | null;
  createdAt: string;
  service: Pick<Service, 'name' | 'duration' | 'imageUrl'>;
  provider: {
    user: Pick<Provider['user'], 'name' | 'avatarUrl'>;
  };
  address: Address;
}

export interface AvailabilityDay {
  date: string;
  available: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Booking flow state
export interface BookingDraft {
  provider: Provider | null;
  service: Service | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  address: Address | null;
  clientNote: string;
  paymentMethod: 'CASH' | 'CARD_ON_SITE';
}
