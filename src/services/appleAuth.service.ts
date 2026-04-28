import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export interface AppleUser {
  identityToken: string;
  authorizationCode: string;
  /** Only returned on first login — null on subsequent logins */
  email: string | null;
  /** Only returned on first login — null on subsequent logins */
  fullName: string | null;
  appleUserId: string;
}

export type AppleSignInError =
  | 'CANCELLED'
  | 'NOT_AVAILABLE'
  | 'CREDENTIAL_REVOKED'
  | 'UNKNOWN';

/**
 * Returns true if Apple Sign-In is available on this device.
 * iOS 13+ only. Always false on Android.
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

/**
 * Triggers the native Apple Sign-In sheet.
 * Throws with a typed code on failure.
 */
export async function signInWithApple(): Promise<AppleUser> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw Object.assign(new Error('No identity token received from Apple'), {
      code: 'UNKNOWN' as AppleSignInError,
    });
  }

  // Compose full name — Apple only returns it on the FIRST login
  const fullName =
    credential.fullName?.givenName && credential.fullName?.familyName
      ? `${credential.fullName.givenName} ${credential.fullName.familyName}`.trim()
      : credential.fullName?.givenName?.trim() ?? null;

  return {
    identityToken: credential.identityToken,
    authorizationCode: credential.authorizationCode ?? '',
    email: credential.email ?? null,   // null on repeat logins
    fullName,                           // null on repeat logins
    appleUserId: credential.user,
  };
}

export function parseAppleError(error: any): {
  code: AppleSignInError;
  message: string;
} {
  // ERR_REQUEST_CANCELED is thrown when user taps "Cancel"
  if (
    error?.code === 'ERR_REQUEST_CANCELED' ||
    error?.message?.includes('canceled')
  ) {
    return { code: 'CANCELLED', message: 'Connexion annulée' };
  }
  if (error?.code === 'ERR_REQUEST_NOT_HANDLED') {
    return {
      code: 'NOT_AVAILABLE',
      message: 'Apple Sign-In non disponible sur cet appareil.',
    };
  }
  if (error?.code === 'ERR_REQUEST_REVOKED') {
    return {
      code: 'CREDENTIAL_REVOKED',
      message: 'Autorisation Apple révoquée. Reconnectez-vous.',
    };
  }
  return {
    code: 'UNKNOWN',
    message: error?.message ?? 'Erreur de connexion Apple. Réessayez.',
  };
}
