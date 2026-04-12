import { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
  phone: z.string().regex(/^\+212[0-9]{9}$/, 'Format : +212XXXXXXXXX'),
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sendOtp } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '+212' },
  });

  const onSubmit = async ({ phone }: { phone: string }) => {
    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone, mode: 'reset' } });
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Impossible d\'envoyer le code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScreenHeader title="Mot de passe oublié" />
      <View className="px-6 pt-8 gap-5">
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Votre numéro de téléphone"
              placeholder="+212600000000"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={errors.phone?.message}
            />
          )}
        />
        <Button label="Envoyer le code" loading={loading} onPress={handleSubmit(onSubmit)} />
      </View>
    </KeyboardAvoidingView>
  );
}
