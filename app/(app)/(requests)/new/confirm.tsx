import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { useCreateRequest } from '../../../../src/hooks/useRequests';

export default function RequestConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId: string; description: string; photos: string }>();
  const { mutateAsync: createRequest, isPending } = useCreateRequest();

  const photos = JSON.parse(params.photos ?? '[]') as string[];

  const handleSend = async () => {
    try {
      await createRequest({
        categoryId: params.categoryId,
        description: params.description,
        photoUrls: photos,
      });
      Alert.alert('Demande envoyée', 'Vous recevrez des offres sous peu.', [
        { text: 'OK', onPress: () => router.replace('/(app)/(requests)') },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Impossible d\'envoyer la demande');
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingBottom: insets.bottom + 16 }}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Confirmer la demande" subtitle="Étape 3 sur 3" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>

        <View className="bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Description</Text>
          <Text className="text-sm text-gray-700 leading-5">{params.description}</Text>
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
            Photos ({photos.length})
          </Text>
          {photos.length === 0 ? (
            <Text className="text-sm text-gray-400">Aucune photo ajoutée</Text>
          ) : (
            <Text className="text-sm text-gray-600">{photos.length} photo(s) jointe(s)</Text>
          )}
        </View>

        <Button label="Envoyer la demande" loading={isPending} onPress={handleSend} />
      </ScrollView>
    </View>
  );
}
