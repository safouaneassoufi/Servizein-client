import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react-native';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { useBookingStore } from '../../../../src/store/booking.store';
import { useCreateBooking } from '../../../../src/hooks/useBooking';
import { formatDate, formatPrice } from '../../../../src/utils/format';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft } = useBookingStore();
  const { mutate: createBooking, isPending } = useCreateBooking();

  const { provider, service, selectedDate, selectedSlot, address } = draft;
  if (!provider || !service || !selectedDate || !selectedSlot || !address) {
    router.replace('/(app)/(bookings)/new/date');
    return null;
  }

  // Fee estimé (affiché mais calculé côté backend)
  const estimatedFee = service.price ? Math.max(10, Math.min(50, service.price * 0.05)) : 0;
  const estimatedTotal = service.price ? service.price + estimatedFee : 0;

  const handleConfirm = () => {
    createBooking(
      {
        providerId: provider.id,
        serviceId: service.id,
        addressId: address.id,
        scheduledDate: selectedDate,
        scheduledSlot: selectedSlot,
        clientNote: draft.clientNote || undefined,
        paymentMethod: draft.paymentMethod,
      },
      {
        onSuccess: (booking) => router.replace({ pathname: '/(app)/(bookings)/new/success', params: { bookingId: booking.id } }),
        onError: (error: any) => Alert.alert('Erreur', error.message ?? 'Réservation impossible'),
      }
    );
  };

  const Row = ({ icon: Icon, label, value }: any) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50">
      <View className="h-8 w-8 bg-gray-100 rounded-lg items-center justify-center">
        <Icon size={15} color="#6b7280" />
      </View>
      <Text className="text-sm text-gray-500 flex-1">{label}</Text>
      <Text className="text-sm font-semibold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Récapitulatif" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Prestataire & service */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Service</Text>
          <Text className="font-bold text-gray-900">{service.name}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">avec {provider.user.name}</Text>
        </View>

        {/* Détails */}
        <View className="bg-white rounded-2xl border border-gray-100 px-4 mb-3">
          <Row icon={Calendar} label="Date" value={formatDate(selectedDate)} />
          <Row icon={Clock} label="Créneau" value={selectedSlot} />
          <Row icon={MapPin} label="Adresse" value={`${address.line1}, ${address.city}`} />
          <Row icon={CreditCard} label="Paiement" value={draft.paymentMethod === 'CASH' ? 'Espèces' : 'Carte sur place'} />
        </View>

        {/* Tarif */}
        {service.price && (
          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Tarif estimé</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Service</Text>
              <Text className="text-sm text-gray-900">{formatPrice(service.price)}</Text>
            </View>
            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
              <Text className="text-sm text-gray-600">Frais plateforme</Text>
              <Text className="text-sm text-gray-900">{formatPrice(estimatedFee)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-bold text-gray-900">Total</Text>
              <Text className="font-bold text-primary text-base">{formatPrice(estimatedTotal)}</Text>
            </View>
            <Text className="text-xs text-gray-400 mt-2">* Le montant final sera calculé et confirmé lors de la réservation.</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3" style={{ paddingBottom: insets.bottom + 8 }}>
        <Button label="Confirmer la réservation" loading={isPending} onPress={handleConfirm} />
      </View>
    </View>
  );
}
