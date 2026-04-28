import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/auth.store';
import { usersApi } from '../../src/api/users.api';
import { authApi } from '../../src/api/auth.api';
import { registerPushToken } from '../../src/hooks/usePushNotifications';
import {
  verifyPhoneOtp,
  resendPhoneOtp,
  clearPhoneConfirmation,
  parseFirebasePhoneError,
} from '../../src/services/firebasePhone.service';

const RESEND_COOLDOWN_S = 60;

export default function PhoneOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setTokens, setUser } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputs = useRef<TextInput[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      clearPhoneConfirmation();
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_S);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleChange = (val: string, idx: number) => {
    // Accept single digit only
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handlePaste = (text: string, idx: number) => {
    // Handle paste of full 6-digit code
    const digits = text.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      setCode(digits.split(''));
      inputs.current[5]?.focus();
    } else {
      handleChange(text.slice(-1), idx);
    }
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Code incomplet', 'Entrez les 6 chiffres reçus par SMS.');
      return;
    }
    setLoading(true);
    try {
      // Verify OTP → get Firebase ID token
      const firebaseUser = await verifyPhoneOtp(fullCode);

      // Exchange Firebase ID token for our JWT pair
      const tokens = await authApi.firebaseLogin(firebaseUser.idToken);
      await setTokens(tokens.accessToken, tokens.refreshToken);

      // Fetch user profile
      const me = await usersApi.getMe();
      setUser(me);

      registerPushToken().catch(() => {});
      router.replace('/(app)/(home)');
    } catch (err: any) {
      const { message } = parseFirebasePhoneError(err);
      Alert.alert('Code invalide', message);
      // Reset inputs
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await resendPhoneOtp(phone);
      startCooldown();
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      Alert.alert('Code envoyé', 'Un nouveau code SMS a été envoyé.');
    } catch (err: any) {
      const { message } = parseFirebasePhoneError(err);
      Alert.alert('Erreur', message);
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/\d/g, '·') + phone.slice(-4)
    : '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScreenHeader title="Vérification SMS" />

      <View className="flex-1 px-6 pt-8">
        {/* Description */}
        <Text className="text-base text-gray-600 mb-1">
          Code envoyé au
        </Text>
        <Text className="text-lg font-bold text-gray-900 mb-2">
          {maskedPhone}
        </Text>
        <Text className="text-gray-400 text-xs mb-8">
          Entrez le code à 6 chiffres reçu par SMS.
        </Text>

        {/* 6-digit code inputs */}
        <View className="flex-row justify-between mb-8 gap-2">
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { if (r) inputs.current[idx] = r; }}
              className={`flex-1 h-14 border-2 rounded-xl text-center text-2xl font-bold text-gray-900 ${
                digit ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
              value={digit}
              onChangeText={(v) => {
                // Detect paste (length > 1)
                if (v.length > 1) {
                  handlePaste(v, idx);
                } else {
                  handleChange(v, idx);
                }
              }}
              keyboardType="number-pad"
              maxLength={6} // allow 6 for paste detection
              selectTextOnFocus
              autoFocus={idx === 0}
            />
          ))}
        </View>

        {/* Verify button */}
        <Button
          label="Valider le code"
          loading={loading}
          onPress={handleVerify}
        />

        {/* Resend */}
        <TouchableOpacity
          className="mt-5 items-center h-10 justify-center"
          onPress={handleResend}
          disabled={cooldown > 0 || resending}
        >
          {resending ? (
            <ActivityIndicator size="small" color="#6b7280" />
          ) : (
            <Text
              className={`text-sm ${
                cooldown > 0 ? 'text-gray-400' : 'text-primary font-semibold'
              }`}
            >
              {cooldown > 0
                ? `Renvoyer dans ${cooldown}s`
                : 'Renvoyer le code SMS'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Wrong number → go back */}
        <TouchableOpacity
          className="mt-3 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-gray-400 text-sm">
            Modifier le numéro
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
