import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Module-level singleton — persists between phone-login and phone-otp screens
// without needing to serialize the confirmation object into route params.
let _confirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

export interface FirebasePhoneUser {
  idToken: string;
  phone: string;
  uid: string;
}

export type FirebasePhoneError =
  | 'INVALID_PHONE'
  | 'TOO_MANY_REQUESTS'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

/**
 * Step 1 — send SMS OTP via Firebase.
 *
 * Android: invisible reCAPTCHA fires automatically via Play Integrity / SafetyNet.
 *          No extra setup needed on real devices. Test numbers bypass this.
 * iOS:     no reCAPTCHA at all.
 *
 * Stores the ConfirmationResult internally so phone-otp.tsx can call
 * verifyPhoneOtp() without passing the object through route params.
 */
export async function sendPhoneOtp(phone: string): Promise<void> {
  _confirmation = await auth().signInWithPhoneNumber(phone, true /* forceResend */);
}

/**
 * Step 2 — confirm the 6-digit code entered by the user.
 * Returns Firebase ID token + user info.
 */
export async function verifyPhoneOtp(code: string): Promise<FirebasePhoneUser> {
  if (!_confirmation) {
    throw new Error('No pending verification. Please request a new code.');
  }
  const credential = await _confirmation.confirm(code);
  if (!credential?.user) throw new Error('Verification failed — no user returned.');

  const idToken = await credential.user.getIdToken(true);
  return {
    idToken,
    phone: credential.user.phoneNumber ?? '',
    uid: credential.user.uid,
  };
}

/**
 * Resend OTP to the same phone number (replaces internal confirmation).
 */
export async function resendPhoneOtp(phone: string): Promise<void> {
  _confirmation = await auth().signInWithPhoneNumber(phone, true);
}

/** Clear confirmation (on screen unmount / cancel). */
export function clearPhoneConfirmation(): void {
  _confirmation = null;
}

export function parseFirebasePhoneError(error: any): {
  code: FirebasePhoneError;
  message: string;
} {
  const code: string = error?.code ?? '';

  if (code === 'auth/invalid-phone-number') {
    return {
      code: 'INVALID_PHONE',
      message: 'Numéro invalide. Utilisez le format +212XXXXXXXXX.',
    };
  }
  if (code === 'auth/too-many-requests') {
    return {
      code: 'TOO_MANY_REQUESTS',
      message: 'Trop de tentatives. Réessayez dans quelques minutes.',
    };
  }
  if (code === 'auth/quota-exceeded') {
    return {
      code: 'QUOTA_EXCEEDED',
      message: 'Quota SMS Firebase dépassé. Réessayez demain.',
    };
  }
  if (
    code === 'auth/invalid-verification-code' ||
    code === 'auth/invalid-verification-id'
  ) {
    return { code: 'INVALID_CODE', message: 'Code incorrect. Vérifiez votre SMS.' };
  }
  if (code === 'auth/code-expired') {
    return {
      code: 'CODE_EXPIRED',
      message: 'Code expiré. Demandez un nouveau code.',
    };
  }
  if (code === 'auth/session-expired') {
    return {
      code: 'SESSION_EXPIRED',
      message: 'Session expirée. Recommencez.',
    };
  }
  if (code?.includes('network') || error?.message?.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Erreur réseau. Vérifiez votre connexion.',
    };
  }
  return { code: 'UNKNOWN', message: error?.message ?? 'Erreur inconnue.' };
}
