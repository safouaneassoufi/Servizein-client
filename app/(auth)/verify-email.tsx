import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../src/store/auth.store';
import { usersApi } from '../../src/api/users.api';
import { authApi } from '../../src/api/auth.api';
import {
  checkEmailVerified,
  resendVerificationEmail,
} from '../../src/services/firebaseEmail.service';

const POLL_INTERVAL_MS = 3000; // check every 3s
const RESEND_COOLDOWN_S = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setTokens, setUser } = useAuthStore();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll Firebase every 3s to detect when user clicks the link
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const verified = await checkEmailVerified();
      if (verified) {
        clearInterval(pollRef.current!);
        await finishLogin();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const finishLogin = async () => {
    setChecking(true);
    try {
      // Get fresh ID token (email_verified=true now)
      const user = auth().currentUser;
      if (!user) throw new Error('No current user');
      const idToken = await user.getIdToken(true);

      const tokens = await authApi.firebaseLogin(idToken);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      const me = await usersApi.getMe();
      setUser(me);
      router.replace('/(app)/(home)' as any);
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de finaliser la connexion');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_S);
      // Start cooldown timer
      cooldownRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(cooldownRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      Alert.alert('Envoyé', 'Un nouveau lien de vérification a été envoyé.');
    } catch {
      Alert.alert('Erreur', 'Impossible de renvoyer l\'email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckManually = async () => {
    setChecking(true);
    const verified = await checkEmailVerified();
    setChecking(false);
    if (verified) {
      await finishLogin();
    } else {
      Alert.alert('Email non vérifié', 'Cliquez sur le lien dans votre email puis réessayez.');
    }
  };

  return (
    <View
      className="flex-1 bg-white px-6 justify-center items-center"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Icon */}
      <Text style={{ fontSize: 64 }}>📧</Text>

      <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
        Vérifiez votre email
      </Text>

      <Text className="text-gray-500 text-sm text-center mt-3 leading-6">
        Un lien de vérification a été envoyé à{'\n'}
        <Text className="font-semibold text-gray-800">{email}</Text>
      </Text>

      <Text className="text-gray-400 text-xs text-center mt-2">
        Cliquez sur le lien dans l'email pour activer votre compte.
        Cette page se met à jour automatiquement.
      </Text>

      {/* Auto-polling indicator */}
      <View className="flex-row items-center gap-2 mt-6">
        <ActivityIndicator size="small" color="#1a56db" />
        <Text className="text-primary text-sm">En attente de vérification...</Text>
      </View>

      {/* Manual check */}
      <TouchableOpacity
        className="mt-8 bg-primary rounded-xl h-12 w-full items-center justify-center"
        onPress={handleCheckManually}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">J'ai vérifié mon email</Text>
        )}
      </TouchableOpacity>

      {/* Resend */}
      <TouchableOpacity
        className="mt-3 h-12 w-full items-center justify-center rounded-xl border border-gray-200"
        onPress={handleResend}
        disabled={resending || cooldown > 0}
      >
        {resending ? (
          <ActivityIndicator color="#374151" size="small" />
        ) : (
          <Text className="text-gray-600 text-sm font-medium">
            {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer l\'email'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text className="text-gray-400 text-sm">← Retour à la connexion</Text>
      </TouchableOpacity>
    </View>
  );
}
