import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../src/api/auth.api';
import { usersApi } from '../../src/api/users.api';
import { useAuthStore } from '../../src/store/auth.store';
import { useAuth } from '../../src/hooks/useAuth';
import { GoogleIcon } from '../../src/components/ui/GoogleIcon';
import { AppleIcon } from '../../src/components/ui/AppleIcon';
import { isAppleSignInAvailable } from '../../src/services/appleAuth.service';

const schema = z.object({
  identifier: z.string().min(1, 'Champ requis'),
  password: z.string().min(8, '8 caractères minimum'),
});
type FormData = z.infer<typeof schema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOGIN_EMAIL_ROUTE: any = '/(auth)/login-email';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PHONE_LOGIN_ROUTE: any = '/(auth)/phone-login';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setTokens, setUser } = useAuthStore();
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleAppleLogin = async () => {
    setAppleLoading(true);
    try {
      await loginWithApple();
      router.replace('/(app)/(home)');
    } catch (error: any) {
      Alert.alert('Erreur Apple', error.message ?? 'Connexion Apple impossible');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/(app)/(home)');
    } catch (error: any) {
      Alert.alert('Erreur Google', error.message ?? 'Connexion Google impossible');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tokens = await authApi.login(data.identifier, data.password);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await usersApi.getMe();
      setUser(user);
      router.replace('/(app)/(home)');
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Connexion</Text>
        <Text className="text-base text-gray-500 mb-8">
          Bienvenue sur ServiZein
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Téléphone ou email
            </Text>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-gray-200 rounded-xl px-4 h-12 text-base text-gray-900"
                  placeholder="+212600000000"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {errors.identifier && (
              <Text className="text-red-500 text-xs mt-1">{errors.identifier.message}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-gray-200 rounded-xl px-4 h-12 text-base text-gray-900"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                />
              )}
            />
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          className="mt-6 bg-primary rounded-xl h-12 items-center justify-center"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => router.push('/(auth)/reset-password')}
        >
          <Text className="text-primary text-sm">Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* ─── Séparateur ─── */}
        <View className="flex-row items-center mt-6 gap-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 text-xs">ou continuer avec</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* ─── Bouton Google ─── */}
        <TouchableOpacity
          className="mt-4 h-12 rounded-xl border border-gray-200 flex-row items-center justify-center gap-3 bg-white"
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          activeOpacity={0.7}
        >
          {googleLoading ? (
            <ActivityIndicator color="#374151" size="small" />
          ) : (
            <>
              <GoogleIcon size={20} />
              <Text className="text-gray-700 font-semibold text-sm">Continuer avec Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ─── Bouton Apple (iOS uniquement) ─── */}
        {appleAvailable && (
          <TouchableOpacity
            className="mt-3 h-12 rounded-xl flex-row items-center justify-center gap-3 bg-black"
            onPress={handleAppleLogin}
            disabled={appleLoading}
            activeOpacity={0.85}
          >
            {appleLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <AppleIcon size={18} color="#ffffff" />
                <Text className="text-white font-semibold text-sm">Continuer avec Apple</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ─── Bouton SMS ─── */}
        <TouchableOpacity
          className="mt-3 h-12 rounded-xl border border-gray-200 flex-row items-center justify-center gap-3 bg-white"
          onPress={() => router.push(PHONE_LOGIN_ROUTE)}
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-semibold text-sm">Connexion par SMS</Text>
        </TouchableOpacity>

        {/* ─── Bouton Email ─── */}
        <TouchableOpacity
          className="mt-2 h-12 rounded-xl border border-gray-200 flex-row items-center justify-center gap-3 bg-white"
          onPress={() => router.push(LOGIN_EMAIL_ROUTE)}
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-semibold text-sm">Connexion par email</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-sm">Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-primary font-semibold text-sm">S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
