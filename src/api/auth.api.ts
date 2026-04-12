import { apiClient } from './client';
import type { AuthTokens } from '../types/auth.types';

export const authApi = {
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) => apiClient.post<any, { message: string; userId: string }>('/auth/register', data),

  sendOtp: (phone: string) =>
    apiClient.post<any, { message: string }>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post<any, AuthTokens>('/auth/verify-otp', { phone, code }),

  login: (identifier: string, password: string) =>
    apiClient.post<any, AuthTokens>('/auth/login', { identifier, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<any, AuthTokens>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<any, { message: string }>('/auth/logout', { refreshToken }),

  resetPassword: (phone: string, code: string, newPassword: string) =>
    apiClient.post<any, AuthTokens>('/auth/reset-password', { phone, code, newPassword }),
};
