import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      {/* Illustration */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-24 w-24 rounded-3xl bg-primary items-center justify-center mb-8">
          <Text className="text-5xl">🔧</Text>
        </View>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
          ServiZein
        </Text>
        <Text className="text-base text-gray-500 text-center leading-6">
          Trouvez le bon prestataire, réservez en quelques secondes.
        </Text>
      </View>

      {/* Actions */}
      <View className="px-6 gap-3">
        <Button
          label="Se connecter"
          onPress={() => router.push('/(auth)/login')}
        />
        <Button
          label="Créer un compte"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
        />
      </View>
    </View>
  );
}
