import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// Web Client ID (OAuth 2.0 — type 3) from google-services.json / Firebase console
const WEB_CLIENT_ID =
  '1052339658783-3b9rnuka0pd23dfgj2ps0ftf9k4pvomn.apps.googleusercontent.com';

// Configure once at app startup (called in _layout.tsx)
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

export interface GoogleUser {
  idToken: string;
  email: string;
  name: string;
  photo: string | null;
  googleId: string;
}

export type GoogleSignInError =
  | 'CANCELLED'
  | 'NO_PLAY_SERVICES'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export async function signInWithGoogle(): Promise<GoogleUser> {
  // Check Play Services (Android only — no-op on iOS)
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const userInfo = await GoogleSignin.signIn();

  // idToken is always present when webClientId is set
  if (!userInfo.data?.idToken) {
    throw Object.assign(new Error('No ID token received from Google'), {
      code: 'UNKNOWN' as GoogleSignInError,
    });
  }

  return {
    idToken: userInfo.data.idToken,
    email: userInfo.data.user.email,
    name: userInfo.data.user.name ?? userInfo.data.user.email,
    photo: userInfo.data.user.photo ?? null,
    googleId: userInfo.data.user.id,
  };
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Non-blocking — user may not be signed in to Google
  }
}

export function parseGoogleError(error: any): {
  code: GoogleSignInError;
  message: string;
} {
  if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    return { code: 'CANCELLED', message: 'Connexion annulée' };
  }
  if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return {
      code: 'NO_PLAY_SERVICES',
      message: 'Google Play Services non disponible. Mettez à jour votre appareil.',
    };
  }
  if (
    error.code === statusCodes.IN_PROGRESS ||
    error.message?.toLowerCase().includes('network')
  ) {
    return { code: 'NETWORK_ERROR', message: 'Erreur réseau. Vérifiez votre connexion.' };
  }
  return { code: 'UNKNOWN', message: 'Erreur de connexion Google. Réessayez.' };
}
