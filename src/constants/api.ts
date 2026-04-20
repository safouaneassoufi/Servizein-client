import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as {
  apiUrl: string;
  apiUrlProd: string;
} | undefined;

// In development (__DEV__) use local apiUrl, in production use apiUrlProd (Railway)
export const API_BASE_URL = __DEV__
  ? (extra?.apiUrl ?? 'http://10.0.2.2:3000/api/v1')
  : (extra?.apiUrlProd ?? 'https://servizein-api-production.up.railway.app/api/v1');

export const API_TIMEOUT = 15000;
