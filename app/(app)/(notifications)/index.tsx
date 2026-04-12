import { View, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { NotificationItem } from '../../../src/components/features/NotificationItem';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { useNotifications, useMarkRead, useMarkAllRead } from '../../../src/hooks/useNotifications';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { data: notifications, isLoading, refetch } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead } = useMarkAllRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title="Notifications"
        showBack={false}
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={() => markAllRead()}>
              <Text className="text-sm text-primary font-semibold">Tout lire</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => { if (!item.read) markRead(item.id); }}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="🔔" title="Aucune notification" description="Vous serez notifié ici de l'activité sur votre compte." />
          }
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
