import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { formatPhone } from '../../src/utils/format';

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: 'register' | 'reset' }>();
  const { verifyOtp, sendOtp } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Erreur', 'Entrez le code complet à 6 chiffres');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'reset') {
        // Don't verify here — pass phone+code to change-password screen
        router.replace({
          pathname: '/(auth)/change-password' as any,
          params: { phone, code: fullCode },
        });
        return;
      }
      await verifyOtp(phone, fullCode);
      router.replace('/(app)/(home)');
    } catch (error: any) {
      Alert.alert('Code invalide', error.message ?? 'Code incorrect ou expiré');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await sendOtp(phone);
      setResendTimer(60);
      Alert.alert('Code envoyé', 'Un nouveau code a été envoyé');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScreenHeader title="Vérification" />
      <View className="flex-1 px-6 pt-8">
        <Text className="text-base text-gray-600 mb-1">
          Code envoyé au
        </Text>
        <Text className="text-lg font-bold text-gray-900 mb-8">
          {formatPhone(phone)}
        </Text>

        {/* Code input */}
        <View className="flex-row justify-between mb-8">
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { if (r) inputs.current[idx] = r; }}
              className={`h-14 w-12 border-2 rounded-xl text-center text-xl font-bold text-gray-900 ${digit ? 'border-primary' : 'border-gray-200'}`}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Hint OTP fixe */}
        <View style={{ backgroundColor: '#eff6ff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
          <Text style={{ color: '#1d4ed8', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
            Code de vérification : 123456
          </Text>
        </View>

        <Button label="Valider" loading={loading} onPress={handleVerify} />

        <TouchableOpacity
          className="mt-5 items-center"
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          <Text className={`text-sm ${resendTimer > 0 ? 'text-gray-400' : 'text-primary font-semibold'}`}>
            {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
