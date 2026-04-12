import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Button } from '../../src/components/ui/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, code } = useLocalSearchParams<{ phone: string; code: string }>();
  const setTokens = useAuthStore((s) => s.setTokens);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = password.length >= 8 && password === confirm;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const tokens = await authApi.resetPassword(phone, code, password);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      router.replace('/(app)/(home)');
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Impossible de réinitialiser le mot de passe');
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
      <ScreenHeader title="Nouveau mot de passe" />
      <View className="flex-1 px-6 pt-8">
        <Text className="text-base text-gray-600 mb-8">
          Choisissez un nouveau mot de passe sécurisé.
        </Text>

        <Text className="text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</Text>
        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-4">
          <TextInput
            className="flex-1 py-3 text-sm text-gray-900"
            placeholder="Minimum 8 caractères"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
            {showPwd ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold text-gray-700 mb-1.5">Confirmer le mot de passe</Text>
        <View className="border border-gray-200 rounded-xl px-4 mb-6">
          <TextInput
            className="py-3 text-sm text-gray-900"
            placeholder="Répéter le mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPwd}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {confirm.length > 0 && password !== confirm && (
          <Text className="text-xs text-red-500 -mt-4 mb-4">Les mots de passe ne correspondent pas</Text>
        )}

        <Button
          label="Confirmer"
          loading={loading}
          disabled={!isValid}
          onPress={handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
