import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useRequests, useCancelRequest } from '../../../src/hooks/useRequests';
import type { ServiceRequest } from '../../../src/api/requests.api';

const STATUS_LABELS: Record<ServiceRequest['status'], string> = {
  OPEN: 'Ouverte',
  QUOTED: 'Devis reçus',
  ACCEPTED: 'Acceptée',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
};

const STATUS_COLORS: Record<ServiceRequest['status'], string> = {
  OPEN: 'text-blue-600 bg-blue-50',
  QUOTED: 'text-orange-600 bg-orange-50',
  ACCEPTED: 'text-green-600 bg-green-50',
  CANCELLED: 'text-gray-500 bg-gray-100',
  EXPIRED: 'text-red-500 bg-red-50',
};

export default function RequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: requests, isLoading, refetch } = useRequests();
  const { mutate: cancelRequest } = useCancelRequest();

  const handleCancel = (req: ServiceRequest) => {
    Alert.alert('Annuler', 'Annuler cette demande ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: () => cancelRequest(req.id),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Mes demandes" showBack={false} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mx-4 mb-2.5 bg-white rounded-2xl border border-gray-100 p-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-0.5">{item.category.icon} {item.category.name}</Text>
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <View className={`ml-2 px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status].split(' ')[1]}`}>
                  <Text className={`text-[11px] font-semibold ${STATUS_COLORS[item.status].split(' ')[0]}`}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long' })}
              </Text>
              {(item.status === 'OPEN' || item.status === 'QUOTED') && (
                <TouchableOpacity
                  className="mt-2 self-start"
                  onPress={() => handleCancel(item)}
                >
                  <Text className="text-xs text-red-500 font-medium">Annuler</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="Aucune demande"
              description="Créez une demande pour recevoir des devis de prestataires."
              actionLabel="Nouvelle demande"
              onAction={() => router.push('/(app)/(requests)/new/description')}
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
