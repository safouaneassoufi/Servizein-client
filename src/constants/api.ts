import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as {
  apiUrl: string;
  apiUrlProd: string;
} | undefined;

export const API_BASE_URL = extra?.apiUrl ?? 'http://10.0.2.2:3000/api/v1';
export const API_TIMEOUT = 15000;
