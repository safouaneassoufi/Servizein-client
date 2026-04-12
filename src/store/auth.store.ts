import { create } from 'zustand';
import { storage } from '../utils/storage';
import type { UserMe } from '../types/auth.types';

interface AuthState {
  user: UserMe | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: UserMe) => void;
  setTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateFromStorage: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: async (access, refresh) => {
    await storage.setTokens(access, refresh);
    set({ isAuthenticated: true });
  },

  logout: async () => {
    await storage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hydrateFromStorage: async () => {
    const token = await storage.getAccessToken();
    const hasToken = !!token;
    set({ isAuthenticated: hasToken, isLoading: false });
    return hasToken;
  },
}));
