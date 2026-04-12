import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useFavorites, useToggleFavorite } from '../../../src/hooks/useFavorites';
import { formatRating } from '../../../src/utils/format';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: favorites, isLoading, refetch } = useFavorites();
  const { mutate: toggle } = useToggleFavorite();

  const handleRemove = (providerId: string, name: string) => {
    Alert.alert('Retirer des favoris', `Retirer ${name} de vos favoris ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => toggle(providerId) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Mes favoris" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={favorites ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mx-4 mb-2.5 bg-white rounded-2xl border border-gray-100 p-4 flex-row items-center gap-3"
              onPress={() => router.push(`/(app)/(home)/provider/${item.providerId}` as any)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.provider.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.provider.user.name)}&size=100` }}
                className="h-12 w-12 rounded-xl"
              />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">{item.provider.user.name}</Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <View className="flex-row items-center gap-0.5">
                    <Star size={11} color="#fbbf24" fill="#fbbf24" />
                    <Text className="text-xs text-gray-600">{formatRating(item.provider.averageRating)}</Text>
                  </View>
                  {item.provider.city && (
                    <View className="flex-row items-center gap-0.5">
                      <MapPin size={11} color="#9ca3af" />
                      <Text className="text-xs text-gray-500">{item.provider.city}</Text>
                    </View>
                  )}
                </View>
                <View className={`mt-1 self-start px-2 py-0.5 rounded-full ${item.provider.available ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <Text className={`text-[10px] font-semibold ${item.provider.available ? 'text-green-700' : 'text-gray-500'}`}>
                    {item.provider.available ? 'Disponible' : 'Indisponible'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(item.providerId, item.provider.user.name)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Heart size={20} color="#ef4444" fill="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="❤️"
              title="Aucun favori"
              description="Ajoutez des prestataires à vos favoris depuis leur fiche."
            />
          }
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
