import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, Shield } from 'lucide-react-native';
import type { Provider } from '../../types/provider.types';
import { formatRating } from '../../utils/format';

interface Props {
  provider: Provider;
  onPress: () => void;
}

export function ProviderCard({ provider, onPress }: Props) {
  return (
    <TouchableOpacity
      className="mx-4 mb-3 bg-white rounded-2xl border border-gray-100 p-4 flex-row gap-3 shadow-sm active:opacity-90"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="relative">
        <Image
          source={{ uri: provider.user.avatarUrl ?? 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider.user.name) }}
          className="h-14 w-14 rounded-xl"
        />
        {provider.available && (
          <View className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-bold text-gray-900 text-sm">{provider.user.name}</Text>
          {provider.verified && (
            <Shield size={12} color="#1a56db" fill="#1a56db" />
          )}
        </View>

        {provider.services[0] && (
          <Text className="text-xs text-gray-500 mt-0.5">{provider.services[0].category.name}</Text>
        )}

        <View className="flex-row items-center gap-3 mt-1.5">
          <View className="flex-row items-center gap-1">
            <Star size={11} color="#d97706" fill="#d97706" />
            <Text className="text-xs font-semibold text-gray-700">{formatRating(provider.averageRating)}</Text>
            <Text className="text-xs text-gray-400">({provider.reviewCount})</Text>
          </View>
          {provider.city && (
            <View className="flex-row items-center gap-0.5">
              <MapPin size={11} color="#9ca3af" />
              <Text className="text-xs text-gray-400">{provider.city}</Text>
            </View>
          )}
        </View>

        {provider.services[0]?.priceType === 'FIXED' && provider.services[0]?.price && (
          <Text className="text-xs font-bold text-primary mt-1">
            À partir de {provider.services[0].price} MAD
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
