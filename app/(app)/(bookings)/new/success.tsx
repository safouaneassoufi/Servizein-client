import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '../../../../src/components/ui/Button';

export default function BookingSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <View
      className="flex-1 bg-white items-center justify-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-24 w-24 bg-green-50 rounded-full items-center justify-center">
          <CheckCircle size={52} color="#16a34a" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          Réservation confirmée !
        </Text>
        <Text className="text-base text-gray-500 text-center leading-6">
          Votre prestataire a été notifié. Vous recevrez une confirmation sous peu.
        </Text>
        {bookingId && (
          <View className="bg-gray-100 rounded-xl px-4 py-2 mt-1">
            <Text className="text-xs text-gray-500 text-center">Référence : {bookingId.slice(-8).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View className="w-full gap-3">
        <Button
          label="Voir ma réservation"
          onPress={() => router.replace(`/(app)/(bookings)/${bookingId}`)}
        />
        <Button
          label="Retour à l'accueil"
          variant="ghost"
          onPress={() => router.replace('/(app)/(home)')}
        />
      </View>
    </View>
  );
}
