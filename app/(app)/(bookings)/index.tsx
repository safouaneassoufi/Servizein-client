import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { BookingCard } from '../../../src/components/features/BookingCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useBookings } from '../../../src/hooks/useBooking';

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: bookings, isLoading, refetch } = useBookings();

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Mes réservations" showBack={false} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={() => router.push(`/(app)/(bookings)/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="Aucune réservation"
              description="Réservez un service pour commencer."
              actionLabel="Explorer"
              onAction={() => router.push('/(app)/(home)')}
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
