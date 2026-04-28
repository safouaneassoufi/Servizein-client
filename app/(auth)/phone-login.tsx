import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { Button } from '../../src/components/ui/Button';
import {
  sendPhoneOtp,
  parseFirebasePhoneError,
} from '../../src/services/firebasePhone.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PHONE_OTP_ROUTE: any = '/(auth)/phone-otp';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('+212');
  const [loading, setLoading] = useState(false);

  const isValid = /^\+[1-9]\d{7,14}$/.test(phone.trim());

  const handleSend = async () => {
    const trimmed = phone.trim();
    if (!isValid) {
      Alert.alert('Format invalide', 'Entrez votre numéro au format international\nEx : +212612345678');
      return;
    }
    setLoading(true);
    try {
      await sendPhoneOtp(trimmed);
      router.push({ pathname: PHONE_OTP_ROUTE, params: { phone: trimmed } });
    } catch (err: any) {
      const { message } = parseFirebasePhoneError(err);
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScreenHeader title="Connexion par SMS" />

      <View className="flex-1 px-6 pt-6 gap-6">
        {/* Explanatory text */}
        <Text className="text-gray-500 text-sm leading-6">
          Entrez votre numéro de téléphone. Nous vous enverrons un code SMS
          à 6 chiffres pour vous connecter.
        </Text>

        {/* Phone input */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Numéro de téléphone
          </Text>
          <TextInput
            ref={inputRef}
            className={`border-2 rounded-xl px-4 h-14 text-lg tracking-widest text-gray-900 ${
              phone.length > 4 && !isValid ? 'border-red-400' : 'border-gray-200 focus:border-primary'
            }`}
            value={phone}
            onChangeText={(v) => {
              // Always keep the + sign
              if (!v.startsWith('+')) setPhone('+' + v.replace(/\+/g, ''));
              else setPhone(v.replace(/[^\d+]/g, ''));
            }}
            placeholder="+212612345678"
            keyboardType="phone-pad"
            autoFocus
            maxLength={16}
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />
          {phone.length > 4 && !isValid && (
            <Text className="text-red-500 text-xs mt-1">
              Format invalide. Ex : +212612345678
            </Text>
          )}
        </View>

        {/* Country hint */}
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="text-blue-700 text-xs font-medium mb-1">Indicatifs courants</Text>
          <Text className="text-blue-600 text-xs">
            Maroc : +212 · France : +33 · Belgique : +32 · Canada : +1
          </Text>
        </View>

        {/* Send button */}
        <Button
          label="Envoyer le code SMS"
          loading={loading}
          onPress={handleSend}
        />

        {/* Info */}
        <View className="flex-row items-start gap-2 mt-2">
          <Text className="text-gray-400 text-xs leading-5">
            En continuant, vous acceptez de recevoir un SMS de vérification.
            Des frais de messagerie peuvent s'appliquer.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
