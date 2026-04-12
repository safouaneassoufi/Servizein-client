import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { mediaApi } from '../../../../src/api/media.api';

export default function RequestPhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId: string; description: string }>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 5) { Alert.alert('Maximum', '5 photos maximum'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploading(true);
      try {
        const filename = asset.uri.split('/').pop() ?? 'photo.jpg';
        const contentType = asset.mimeType ?? 'image/jpeg';
        const { uploadUrl, publicUrl } = await mediaApi.getUploadUrl('gallery', filename, contentType);
        await mediaApi.uploadToR2(uploadUrl, { uri: asset.uri, type: contentType, name: filename });
        setPhotos((prev) => [...prev, publicUrl]);
      } catch (e: any) {
        Alert.alert('Erreur upload', e.message);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom + 16 }}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Photos (optionnel)" subtitle="Étape 2 sur 3" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-gray-500 mb-4">
          Ajoutez des photos pour aider les prestataires à comprendre votre besoin.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {photos.map((uri, i) => (
            <View key={i} className="relative">
              <Image source={{ uri }} className="h-24 w-24 rounded-xl" />
              <TouchableOpacity
                className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full items-center justify-center"
                onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity
              className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? <ActivityIndicator color="#1a56db" /> : <Plus size={24} color="#9ca3af" />}
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-8">
          <Button
            label="Continuer"
            onPress={() => router.push({ pathname: '/(app)/(requests)/new/confirm', params: { ...params, photos: JSON.stringify(photos) } })}
          />
          <Button
            label="Passer cette étape"
            variant="ghost"
            onPress={() => router.push({ pathname: '/(app)/(requests)/new/confirm', params: { ...params, photos: '[]' } })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
