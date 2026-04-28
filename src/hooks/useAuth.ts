import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { storage } from '../utils/storage';
import { registerPushToken } from './usePushNotifications';
import {
  signInWithGoogle,
  signOutFromGoogle,
  parseGoogleError,
} from '../services/googleAuth.service';
import {
  signInWithApple,
  parseAppleError,
} from '../services/appleAuth.service';
import {
  signUpWithEmail,
  signInWithEmail,
  parseFirebaseEmailError,
} from '../services/firebaseEmail.service';
import {
  sendPhoneOtp,
  parseFirebasePhoneError,
} from '../services/firebasePhone.service';

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

  const registerWithEmail = async (email: string, password: string) => {
    try {
      return await signUpWithEmail(email, password);
    } catch (err: any) {
      const { message } = parseFirebaseEmailError(err);
      throw new Error(message);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const firebaseUser = await signInWithEmail(email, password);
      const tokens = await authApi.firebaseLogin(firebaseUser.idToken);
      await store.setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await usersApi.getMe();
      store.setUser(user);
      registerPushToken().catch(() => {});
    } catch (err: any) {
      const { code, message } = parseFirebaseEmailError(err);
      const error = new Error(message) as Error & { code: string };
      error.code = code;
      throw error;
    }
  };

  const loginWithApple = async () => {
    const appleUser = await signInWithApple().catch((err) => {
      const parsed = parseAppleError(err);
      if (parsed.code === 'CANCELLED') return null; // silent cancel
      throw new Error(parsed.message);
    });

    if (!appleUser) return; // user cancelled — do nothing

    const tokens = await authApi.appleLogin({
      identityToken: appleUser.identityToken,
      authorizationCode: appleUser.authorizationCode,
      email: appleUser.email,
      fullName: appleUser.fullName,
    });
    await store.setTokens(tokens.accessToken, tokens.refreshToken);
    const user = await usersApi.getMe();
    store.setUser(user);
    registerPushToken().catch(() => {});
  };

  const loginWithGoogle = async () => {
    // throws { code, message } if user cancels or error occurs
    const googleUser = await signInWithGoogle().catch((err) => {
      const parsed = parseGoogleError(err);
      if (parsed.code === 'CANCELLED') return null; // silent cancel
      throw new Error(parsed.message);
    });

    if (!googleUser) return; // user cancelled — do nothing

    // Exchange Google idToken for our own JWT pair via backend
    const tokens = await authApi.googleLogin(googleUser.idToken);
    await store.setTokens(tokens.accessToken, tokens.refreshToken);
    const user = await usersApi.getMe();
    store.setUser(user);
    registerPushToken().catch(() => {});
  };

  /**
   * Step 1 of Firebase Phone Auth — sends SMS OTP.
   * After this resolves, navigate to phone-otp screen.
   * Step 2 (verifyPhoneOtp) is called directly in phone-otp.tsx.
   */
  const sendPhoneLogin = async (phone: string) => {
    try {
      await sendPhoneOtp(phone);
    } catch (err: any) {
      const { message } = parseFirebasePhoneError(err);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    await signOutFromGoogle();
    await store.logout();
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithApple,
    sendPhoneLogin,
    register,
    sendOtp,
    verifyOtp,
    logout,
  };
}
