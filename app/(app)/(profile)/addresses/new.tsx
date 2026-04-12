import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { useCreateAddress } from '../../../../src/hooks/useAddresses';

export default function NewAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutateAsync: createAddress, isPending } = useCreateAddress();

  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const canSubmit = label.trim() && line1.trim() && city.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createAddress({
        label: label.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        postalCode: postalCode.trim() || undefined,
        isDefault,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Impossible d\'ajouter l\'adresse');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Nouvelle adresse" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1.5">Libellé *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
            placeholder="ex: Maison, Bureau..."
            value={label}
            onChangeText={setLabel}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1.5">Adresse *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
            placeholder="Numéro et nom de rue"
            value={line1}
            onChangeText={setLine1}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-1.5">Complément d'adresse</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
            placeholder="Appartement, étage... (optionnel)"
            value={line2}
            onChangeText={setLine2}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">Ville *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
              placeholder="Casablanca"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="w-28">
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">Code postal</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
              placeholder="20000"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="number-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
          <Text className="text-sm font-medium text-gray-700">Adresse par défaut</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: '#1a56db' }}
          />
        </View>

        <Button label="Enregistrer" loading={isPending} disabled={!canSubmit} onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
