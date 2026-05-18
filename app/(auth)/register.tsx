import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { GoogleIcon } from '../../src/components/ui/GoogleIcon';
import { AppleIcon } from '../../src/components/ui/AppleIcon';
import { isAppleSignInAvailable } from '../../src/services/appleAuth.service';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Format E.164 : +212XXXXXXXXX ou +33XXXXXXXXX'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  password: z.string().min(8, '8 caractères minimum'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTER_EMAIL_ROUTE: any = '/(auth)/register-email';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, loginWithGoogle, loginWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '+212', email: '', password: '', confirmPassword: '' },
  });

  const handleAppleSignup = async () => {
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

  const handleGoogleSignup = async () => {
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
      await register({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
      });
      router.push({ pathname: '/(auth)/otp', params: { phone: data.phone, mode: 'register' } });
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
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="Nom complet" placeholder="Votre nom" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <Input label="Téléphone" placeholder="+212600000000" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} hint="Format : +212XXXXXXXXX" />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email (optionnel)" placeholder="exemple@email.com" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input label="Mot de passe" placeholder="••••••••" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input label="Confirmer le mot de passe" placeholder="••••••••" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
          )}
        />
        <View className="mt-2">
          <Button label="Créer mon compte" loading={loading} onPress={handleSubmit(onSubmit)} />
        </View>

        {/* ─── Séparateur ─── */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 text-xs">ou s'inscrire avec</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* ─── Bouton Google ─── */}
        <TouchableOpacity
          className="h-12 rounded-xl border border-gray-200 flex-row items-center justify-center gap-3 bg-white"
          onPress={handleGoogleSignup}
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
            className="h-12 rounded-xl flex-row items-center justify-center gap-3 bg-black"
            onPress={handleAppleSignup}
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

        {/* ─── Bouton Email ─── */}
        <TouchableOpacity
          className="h-12 rounded-xl border border-gray-200 flex-row items-center justify-center gap-3 bg-white"
          onPress={() => router.push(REGISTER_EMAIL_ROUTE)}
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-semibold text-sm">S'inscrire par email</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-500 text-sm">Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-primary font-semibold text-sm">Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
