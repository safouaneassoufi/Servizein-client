import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { storage } from '../utils/storage';
import { registerPushToken } from './usePushNotifications';

export function useAuth() {
  const store = useAuthStore();

  const login = async (identifier: string, password: string) => {
    const tokens = await authApi.login(identifier, password);
    await store.setTokens(tokens.accessToken, tokens.refreshToken);
    const user = await usersApi.getMe();
    store.setUser(user);
    registerPushToken().catch(() => {}); // non-blocking
  };

  const register = async (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) => {
    return authApi.register(data);
  };

  const sendOtp = (phone: string) => authApi.sendOtp(phone);

  const verifyOtp = async (phone: string, code: string) => {
    const tokens = await authApi.verifyOtp(phone, code);
    await store.setTokens(tokens.accessToken, tokens.refreshToken);
    const user = await usersApi.getMe();
    store.setUser(user);
    registerPushToken().catch(() => {}); // non-blocking
  };

  const logout = async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    await store.logout();
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login,
    register,
    sendOtp,
    verifyOtp,
    logout,
  };
}
