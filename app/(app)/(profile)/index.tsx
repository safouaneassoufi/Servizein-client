import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, MapPin, Heart, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { usersApi } from '../../../src/api/users.api';
import { useAuth } from '../../../src/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: usersApi.getMe,
  });

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuItem = ({ icon: Icon, label, onPress, danger = false }: any) => (
    <TouchableOpacity
      className="flex-row items-center gap-3 px-4 py-3.5 border-b border-gray-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`h-9 w-9 rounded-xl items-center justify-center ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
        <Icon size={17} color={danger ? '#dc2626' : '#374151'} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</Text>
      {!danger && <ChevronRight size={16} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Header profil */}
        <View className="bg-white px-4 pt-6 pb-5 mb-3 items-center">
          <View className="relative">
            <Image
              source={{ uri: user?.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&size=200` }}
              className="h-20 w-20 rounded-2xl"
            />
          </View>
          <Text className="text-xl font-bold text-gray-900 mt-3">{user?.name}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{user?.phone}</Text>
          {user?.email && <Text className="text-xs text-gray-400 mt-0.5">{user.email}</Text>}
        </View>

        {/* Menu */}
        <View className="bg-white rounded-2xl mx-4 mb-3 overflow-hidden border border-gray-100">
          <MenuItem icon={Settings} label="Modifier mon profil" onPress={() => router.push('/(app)/(profile)/edit')} />
          <MenuItem icon={MapPin} label="Mes adresses" onPress={() => router.push('/(app)/(profile)/addresses')} />
          <MenuItem icon={Heart} label="Mes favoris" onPress={() => router.push('/(app)/(profile)/favorites')} />
        </View>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-gray-100">
          <MenuItem icon={LogOut} label="Se déconnecter" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </View>
  );
}
