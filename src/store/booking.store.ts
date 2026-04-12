import { create } from 'zustand';
import type { BookingDraft } from '../types/booking.types';
import type { Provider, Service } from '../types/provider.types';
import type { Address } from '../types/booking.types';

interface BookingState {
  draft: BookingDraft;
  setProvider: (provider: Provider) => void;
  setService: (service: Service) => void;
  setDate: (date: string) => void;
  setSlot: (slot: string) => void;
  setAddress: (address: Address) => void;
  setNote: (note: string) => void;
  setPaymentMethod: (method: 'CASH' | 'CARD_ON_SITE') => void;
  reset: () => void;
}

const initialDraft: BookingDraft = {
  provider: null,
  service: null,
  selectedDate: null,
  selectedSlot: null,
  address: null,
  clientNote: '',
  paymentMethod: 'CASH',
};

export const useBookingStore = create<BookingState>((set) => ({
  draft: initialDraft,

  setProvider: (provider) => set((s) => ({ draft: { ...s.draft, provider } })),
  setService: (service) => set((s) => ({ draft: { ...s.draft, service } })),
  setDate: (selectedDate) => set((s) => ({ draft: { ...s.draft, selectedDate, selectedSlot: null } })),
  setSlot: (selectedSlot) => set((s) => ({ draft: { ...s.draft, selectedSlot } })),
  setAddress: (address) => set((s) => ({ draft: { ...s.draft, address } })),
  setNote: (clientNote) => set((s) => ({ draft: { ...s.draft, clientNote } })),
  setPaymentMethod: (paymentMethod) => set((s) => ({ draft: { ...s.draft, paymentMethod } })),
  reset: () => set({ draft: initialDraft }),
}));
