import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useBookingDetail, useCancelBooking } from '../../../src/hooks/useBooking';
import { formatDate, formatPrice } from '../../../src/utils/format';
import type { BookingStatus } from '../../../src/types/booking.types';

const statusLabel: Record<BookingStatus, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', CANCELLED: 'Annulée', DISPUTED: 'Litige',
};
const statusVariant: Record<BookingStatus, any> = {
  PENDING: 'warning', CONFIRMED: 'info', IN_PROGRESS: 'success',
  COMPLETED: 'muted', CANCELLED: 'danger', DISPUTED: 'danger',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: booking, isLoading } = useBookingDetail(id);
  const { mutate: cancel, isPending } = useCancelBooking();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!booking) return null;

  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

  const handleCancel = () => {
    Alert.alert('Annuler la réservation', 'Êtes-vous sûr ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: () => cancel(
          { id: booking.id },
          { onSuccess: () => router.back(), onError: (e: any) => Alert.alert('Erreur', e.message) }
        ),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Détail réservation" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Status */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center justify-between">
          <View>
            <Text className="font-bold text-gray-900">{booking.service.name}</Text>
            <Text className="text-sm text-gray-500 mt-0.5">avec {booking.provider.user.name}</Text>
          </View>
          <Badge label={statusLabel[booking.status]} variant={statusVariant[booking.status]} />
        </View>

        {/* Infos */}
        <View className="bg-white rounded-2xl border border-gray-100 px-4 mb-3">
          {[
            { icon: Calendar, label: 'Date', value: formatDate(booking.scheduledDate) },
            { icon: Clock, label: 'Heure', value: booking.scheduledSlot },
            { icon: MapPin, label: 'Adresse', value: `${booking.address.line1}, ${booking.address.city}` },
          ].map(({ icon: Icon, label, value }) => (
            <View key={label} className="flex-row items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <View className="h-8 w-8 bg-gray-100 rounded-lg items-center justify-center">
                <Icon size={15} color="#6b7280" />
              </View>
              <Text className="text-sm text-gray-500 flex-1">{label}</Text>
              <Text className="text-sm font-semibold text-gray-900 flex-1 text-right" numberOfLines={2}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Tarif */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Service</Text>
            <Text className="text-sm text-gray-900">{formatPrice(booking.finalPrice)}</Text>
          </View>
          <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500">Frais plateforme</Text>
            <Text className="text-sm text-gray-900">{formatPrice(booking.platformFee)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-bold text-gray-900">Total</Text>
            <Text className="font-bold text-primary">{formatPrice(booking.totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {canCancel && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3" style={{ paddingBottom: insets.bottom + 8 }}>
          <Button label="Annuler la réservation" variant="danger" loading={isPending} onPress={handleCancel} />
        </View>
      )}
    </View>
  );
}
