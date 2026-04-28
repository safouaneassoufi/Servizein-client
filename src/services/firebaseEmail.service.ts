import auth from '@react-native-firebase/auth';

export interface FirebaseEmailUser {
  idToken: string;
  email: string;
  emailVerified: boolean;
  uid: string;
}

export type FirebaseEmailError =
  | 'EMAIL_EXISTS'
  | 'WRONG_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_EMAIL'
  | 'UNKNOWN';

/**
 * Sign up with email + password via Firebase.
 * Sends email verification automatically.
 * Returns idToken only after email is verified.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ uid: string; verificationSent: boolean }> {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  await credential.user.sendEmailVerification();
  return { uid: credential.user.uid, verificationSent: true };
}

/**
 * Sign in with email + password via Firebase.
 * Throws EMAIL_NOT_VERIFIED if user hasn't verified their email yet.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<FirebaseEmailUser> {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  const { user } = credential;

  // Reload to get fresh emailVerified state
  await user.reload();
  const fresh = auth().currentUser!;

  if (!fresh.emailVerified) {
    // Resend verification silently
    await fresh.sendEmailVerification().catch(() => {});
    await auth().signOut();
    const err = new Error('EMAIL_NOT_VERIFIED') as any;
    err.code = 'auth/email-not-verified';
    throw err;
  }

  const idToken = await fresh.getIdToken(true);
  return {
    idToken,
    email: fresh.email!,
    emailVerified: true,
    uid: fresh.uid,
  };
}

/**
 * Resend verification email to currently signed-in user.
 */
export async function resendVerificationEmail(): Promise<void> {
  const user = auth().currentUser;
  if (user) await user.sendEmailVerification();
}

/**
 * Check if current user's email is verified (after they click the link).
 */
export async function checkEmailVerified(): Promise<boolean> {
  const user = auth().currentUser;
  if (!user) return false;
  await user.reload();
  return auth().currentUser?.emailVerified ?? false;
}

export function parseFirebaseEmailError(error: any): {
  code: FirebaseEmailError;
  message: string;
} {
  const code: string = error?.code ?? '';
  if (code === 'auth/email-already-in-use') {
    return { code: 'EMAIL_EXISTS', message: 'Cet email est déjà utilisé.' };
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return { code: 'WRONG_PASSWORD', message: 'Mot de passe incorrect.' };
  }
  if (code === 'auth/user-not-found') {
    return { code: 'USER_NOT_FOUND', message: 'Aucun compte trouvé avec cet email.' };
  }
  if (code === 'auth/too-many-requests') {
    return { code: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives. Réessayez plus tard.' };
  }
  if (code === 'auth/invalid-email') {
    return { code: 'INVALID_EMAIL', message: 'Adresse email invalide.' };
  }
  if (
    code === 'auth/email-not-verified' ||
    error?.message === 'EMAIL_NOT_VERIFIED'
  ) {
    return {
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Email non vérifié. Un nouveau lien de vérification vous a été envoyé.',
    };
  }
  if (code.includes('network')) {
    return { code: 'NETWORK_ERROR', message: 'Erreur réseau. Vérifiez votre connexion.' };
  }
  return { code: 'UNKNOWN', message: error?.message ?? 'Erreur inconnue.' };
}
