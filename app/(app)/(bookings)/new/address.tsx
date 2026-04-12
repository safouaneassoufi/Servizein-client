import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Plus, Check } from 'lucide-react-native';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { useBookingStore } from '../../../../src/store/booking.store';
import { useAddresses } from '../../../../src/hooks/useAddresses';
import type { Address } from '../../../../src/types/booking.types';

export default function BookingAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setAddress } = useBookingStore();
  const { data: addresses, isLoading } = useAddresses();

  const handleSelect = (addr: Address) => {
    setAddress(addr);
  };

  const handleContinue = () => {
    if (!draft.address) {
      Alert.alert('', 'Sélectionnez une adresse');
      return;
    }
    router.push('/(app)/(bookings)/new/summary');
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Adresse d'intervention" />

      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = draft.address?.id === item.id;
            return (
              <TouchableOpacity
                className={`mx-4 mb-2.5 p-4 rounded-2xl border flex-row items-center gap-3 ${isSelected ? 'bg-primary/5 border-primary' : 'bg-white border-gray-100'}`}
                onPress={() => handleSelect(item)}
                activeOpacity={0.85}
              >
                <View className={`h-9 w-9 rounded-xl items-center justify-center ${isSelected ? 'bg-primary' : 'bg-gray-100'}`}>
                  {isSelected ? <Check size={16} color="#fff" /> : <MapPin size={16} color="#6b7280" />}
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-sm">{item.label}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                    {item.line1}, {item.city}
                  </Text>
                </View>
                {item.isDefault && (
                  <View className="bg-primary/10 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] text-primary font-semibold">Défaut</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="📍"
              title="Aucune adresse"
              description="Ajoutez une adresse pour continuer."
              actionLabel="Ajouter une adresse"
              onAction={() => router.push('/(app)/(profile)/addresses')}
            />
          }
          ListHeaderComponent={
            <TouchableOpacity
              className="mx-4 mb-2.5 p-4 rounded-2xl border border-dashed border-gray-300 flex-row items-center gap-3 bg-white"
              onPress={() => router.push('/(app)/(profile)/addresses')}
            >
              <View className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center">
                <Plus size={16} color="#6b7280" />
              </View>
              <Text className="text-sm font-medium text-gray-600">Ajouter une nouvelle adresse</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3" style={{ paddingBottom: insets.bottom + 8 }}>
        <Button label="Continuer" onPress={handleContinue} disabled={!draft.address} />
      </View>
    </View>
  );
}
