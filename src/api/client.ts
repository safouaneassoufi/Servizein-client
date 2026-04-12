import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

// Axios client principal
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Client séparé pour le refresh (évite les boucles infinies)
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor — injecte le token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap data + gestion 401
apiClient.interceptors.response.use(
  (response) => {
    // Backend renvoie { success, data, timestamp } — on unwrap
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await refreshClient.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = response.data.data;

        await storage.setTokens(accessToken, newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        await storage.clearTokens();
        // L'auth store écoutera le clearTokens via rehydration
        return Promise.reject(error);
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError): Error & { statusCode?: number } {
  const data = error.response?.data as { message?: string | string[] } | undefined;
  const message = Array.isArray(data?.message)
    ? data.message.join(', ')
    : data?.message ?? error.message ?? 'Erreur réseau';
  const normalized = new Error(message) as Error & { statusCode?: number };
  normalized.statusCode = error.response?.status;
  return normalized;
}
