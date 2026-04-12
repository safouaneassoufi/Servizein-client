import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, MapPin, Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { useAddresses, useDeleteAddress } from '../../../../src/hooks/useAddresses';
import type { Address } from '../../../../src/types/booking.types';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: addresses, isLoading, refetch } = useAddresses();
  const { mutate: deleteAddr } = useDeleteAddress();

  const handleDelete = (addr: Address) => {
    Alert.alert('Supprimer', `Supprimer "${addr.label}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteAddr(addr.id) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Mes adresses" />
      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mx-4 mb-2.5 bg-white rounded-2xl border border-gray-100 p-4 flex-row items-center gap-3">
              <View className="h-9 w-9 bg-primary/10 rounded-xl items-center justify-center">
                <MapPin size={16} color="#1a56db" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-gray-900 text-sm">{item.label}</Text>
                  {item.isDefault && (
                    <View className="bg-primary/10 rounded-full px-2 py-0.5">
                      <Text className="text-[10px] text-primary font-semibold">Défaut</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-gray-500 mt-0.5">{item.line1}, {item.city}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 size={17} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="📍" title="Aucune adresse" description="Ajoutez votre adresse principale." />
          }
          ListHeaderComponent={
            <TouchableOpacity
              className="mx-4 mb-3 mt-3 p-4 rounded-2xl border border-dashed border-gray-300 flex-row items-center gap-3 bg-white"
              onPress={() => router.push('/(app)/(profile)/addresses/new' as any)}
            >
              <View className="h-9 w-9 bg-gray-100 rounded-xl items-center justify-center">
                <Plus size={16} color="#6b7280" />
              </View>
              <Text className="text-sm font-medium text-gray-600">Ajouter une adresse</Text>
            </TouchableOpacity>
          }
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
