import { useState } from 'react';
import {
  View, Text, KeyboardAvoidingView, Platform,
  TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VERIFY_EMAIL_ROUTE: any = '/(auth)/verify-email';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOGIN_EMAIL_ROUTE: any = '/(auth)/login-email';

export default function RegisterEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerWithEmail(data.email, data.password);
      // Navigate to verification screen with email param
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const verifyPath: any = VERIFY_EMAIL_ROUTE + '?email=' + encodeURIComponent(data.email);
      router.push(verifyPath);
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScreenHeader title="Créer un compte" />
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 text-sm -mt-2 mb-2">
          Un lien de vérification sera envoyé à votre email.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="exemple@email.com"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <View className="mt-2">
          <Button label="Créer mon compte" loading={loading} onPress={handleSubmit(onSubmit)} />
        </View>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-500 text-sm">Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push(LOGIN_EMAIL_ROUTE)}>
            <Text className="text-primary font-semibold text-sm">Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
