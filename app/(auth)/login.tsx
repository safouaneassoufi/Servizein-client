import { useState } from 'react';
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

const schema = z.object({
  identifier: z.string().min(1, 'Champ requis'),
  password: z.string().min(8, '8 caractères minimum'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
