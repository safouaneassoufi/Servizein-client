import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, CalendarDays, ClipboardList, Bell, User } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../src/api/notifications.api';

function TabIcon({ icon: Icon, focused, label }: { icon: any; focused: boolean; label: string }) {
  return (
    <View className="items-center justify-center pt-1">
      <Icon size={22} color={focused ? '#1a56db' : '#9ca3af'} strokeWidth={focused ? 2.5 : 1.8} />
      <Text className={`text-[10px] mt-0.5 ${focused ? 'text-primary font-semibold' : 'text-gray-400'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const { data: badge } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} label="Accueil" />,
        }}
      />
      <Tabs.Screen
        name="(bookings)"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={CalendarDays} focused={focused} label="Réservations" />,
        }}
      />
      <Tabs.Screen
        name="(requests)"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={ClipboardList} focused={focused} label="Demandes" />,
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          tabBarBadge: badge?.count && badge.count > 0 ? badge.count : undefined,
          tabBarIcon: ({ focused }) => <TabIcon icon={Bell} focused={focused} label="Alertes" />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} label="Profil" />,
        }}
      />
    </Tabs>
  );
}
