import { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { usersApi } from '../../../src/api/users.api';
import { useAuthStore } from '../../../src/store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
});

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: usersApi.getMe });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const { mutate: update, isPending } = useMutation({
    mutationFn: (data: { name?: string; email?: string }) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      setUser({ ...(user as any), ...updated });
      qc.invalidateQueries({ queryKey: ['me'] });
      router.back();
    },
    onError: (e: any) => Alert.alert('Erreur', e.message),
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Modifier le profil" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="Nom complet" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
          )}
        />
        <View className="mt-2">
          <Button label="Sauvegarder" loading={isPending} onPress={handleSubmit((d) => update({ name: d.name, email: d.email || undefined }))} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
