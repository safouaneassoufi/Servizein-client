import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, WifiOff } from 'lucide-react-native';
import { catalogApi } from '../../../src/api/catalog.api';
import { providersApi } from '../../../src/api/providers.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { ProviderCard } from '../../../src/components/features/ProviderCard';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data: categories, isLoading: catLoading, isError: catError, refetch: refetchCat } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { data: providersData, isLoading: provLoading, isError: provError, refetch: refetchProv } = useQuery({
    queryKey: ['providers'],
    queryFn: () => providersApi.getAll({ available: true, limit: 10 }),
  });

  const isLoading = catLoading || provLoading;
  const hasError = catError || provError;
  const onRefresh = () => { refetchCat(); refetchProv(); };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </Text>
          <Text className="text-sm text-gray-500">Quel service cherchez-vous ?</Text>
        </View>
        <TouchableOpacity
          className="h-10 w-10 rounded-xl bg-gray-100 items-center justify-center"
          onPress={() => router.push('/(app)/(notifications)')}
        >
          <Bell size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      ) : hasError ? (
        <View className="flex-1 items-center justify-center px-8">
          <WifiOff size={48} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
            Connexion impossible
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Vérifiez votre connexion internet et réessayez.
          </Text>
          <TouchableOpacity
            className="mt-6 px-6 py-3 bg-primary rounded-xl"
            onPress={onRefresh}
          >
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Catégories */}
          <View className="pt-5 pb-2">
            <Text className="px-4 text-base font-bold text-gray-900 mb-3">Catégories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {categories?.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className="items-center"
                  onPress={() => router.push(`/(app)/(home)/category/${cat.id}`)}
                >
                  <View className="h-16 w-16 rounded-2xl bg-primary-50 items-center justify-center mb-1.5">
                    <Text className="text-2xl">{cat.icon ?? '🔧'}</Text>
                  </View>
                  <Text className="text-xs text-gray-600 text-center w-16" numberOfLines={2}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Prestataires disponibles */}
          <View className="pt-5 pb-24">
            <Text className="px-4 text-base font-bold text-gray-900 mb-3">
              Disponibles maintenant
            </Text>
            {providersData?.items.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onPress={() => router.push(`/(app)/(home)/provider/${provider.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
