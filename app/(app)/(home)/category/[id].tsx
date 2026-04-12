import { View, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { ProviderCard } from '../../../../src/components/features/ProviderCard';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { providersApi } from '../../../../src/api/providers.api';
import { catalogApi } from '../../../../src/api/catalog.api';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });
  const category = categories?.find((c) => c.id === id);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers', { categoryId: id }],
    queryFn: () => providersApi.getAll({ categoryId: id, available: true }),
    enabled: !!id,
  });

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={category?.name ?? 'Prestataires'} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={providers?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => router.push(`/(app)/(home)/provider/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="Aucun prestataire" description="Aucun prestataire disponible dans cette catégorie." />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
