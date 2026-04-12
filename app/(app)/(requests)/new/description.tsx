import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../../src/components/ui/ScreenHeader';
import { Button } from '../../../../src/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../../../src/api/catalog.api';

export default function RequestDescriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });

  const canContinue = selectedCategory && description.trim().length >= 20;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Décrire le besoin" subtitle="Étape 1 sur 3" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Catégorie */}
        <Text className="text-sm font-semibold text-gray-700 mb-3">Catégorie de service</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {categories?.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${selectedCategory === cat.id ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text>{cat.icon ?? '🔧'}</Text>
              <Text className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-gray-700'}`}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Description du travail</Text>
        <TextInput
          className="border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 min-h-[140px]"
          placeholder="Décrivez en détail ce dont vous avez besoin... (minimum 20 caractères)"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#9ca3af"
        />
        <Text className="text-xs text-gray-400 mt-1 text-right">{description.length} caractères</Text>

        <View className="mt-5">
          <Button
            label="Continuer"
            disabled={!canContinue}
            onPress={() => router.push({ pathname: '/(app)/(requests)/new/photos', params: { categoryId: selectedCategory!, description } })}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
