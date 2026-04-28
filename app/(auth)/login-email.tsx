import { useState } from 'react';
import {
  View, Text, KeyboardAvoidingView, Platform,
  TouchableOpacity, Alert,
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
  password: z.string().min(1, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VERIFY_EMAIL_ROUTE: any = '/(auth)/verify-email';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTER_EMAIL_ROUTE: any = '/(auth)/register-email';

export default function LoginEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
      router.replace('/(app)/(home)');
    } catch (error: any) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const verifyPath: any = VERIFY_EMAIL_ROUTE + '?email=' + encodeURIComponent(data.email);
        router.push(verifyPath);
      } else {
        Alert.alert('Erreur', error.message ?? 'Connexion impossible');
      }
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
      <ScreenHeader title="Connexion" />
      <View className="flex-1 px-6 justify-center gap-4">

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

        <TouchableOpacity
          className="self-end -mt-2"
          onPress={() => router.push('/(auth)/reset-password')}
        >
          <Text className="text-primary text-sm">Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <Button label="Se connecter" loading={loading} onPress={handleSubmit(onSubmit)} />

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500 text-sm">Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push(REGISTER_EMAIL_ROUTE)}>
            <Text className="text-primary font-semibold text-sm">S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
