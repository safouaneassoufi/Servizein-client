import { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, MapPin, Shield, Clock, Heart, ChevronRight } from 'lucide-react-native';
import { useProvider } from '../../../../src/hooks/useProviders';
import { useBookingStore } from '../../../../src/store/booking.store';
import { useFavoriteStatus, useToggleFavorite } from '../../../../src/hooks/useFavorites';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { Button } from '../../../../src/components/ui/Button';
import { Badge } from '../../../../src/components/ui/Badge';
import { formatPrice, formatRating, formatDuration } from '../../../../src/utils/format';
import type { Service } from '../../../../src/types/provider.types';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setProvider, setService } = useBookingStore();
  const [tab, setTab] = useState<'services' | 'about'>('services');

  const { data: provider, isLoading } = useProvider(id);
  const { data: favStatus } = useFavoriteStatus(id);
  const { mutate: toggleFav } = useToggleFavorite();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!provider) return null;

  const isFav = favStatus?.favorited ?? false;

  const handleBookService = (service: Service) => {
    if (service.priceType === 'QUOTE') {
      Alert.alert('Devis', 'Ce service nécessite un devis. Envoyez une demande.');
      return;
    }
    setProvider(provider);
    setService(service);
    router.push('/(app)/(bookings)/new/date');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button + Favorite */}
      <View style={{ paddingTop: insets.top }} className="absolute top-0 left-0 right-0 z-10 px-4 py-2 flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-white/90 rounded-xl items-center justify-center shadow-sm"
        >
          <Text className="text-gray-800 font-bold">←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFav(id)}
          className="h-10 w-10 bg-white/90 rounded-xl items-center justify-center shadow-sm"
        >
          <Heart size={20} color={isFav ? '#ef4444' : '#9ca3af'} fill={isFav ? '#ef4444' : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image */}
        <View className="h-56 bg-gray-200" style={{ paddingTop: insets.top }}>
          <Image
            source={{ uri: provider.user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.user.name)}&size=400` }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/30" />
          <View className="absolute bottom-4 left-4 right-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-white">{provider.user.name}</Text>
              {provider.verified && <Shield size={16} color="#fff" fill="#1a56db" />}
            </View>
            <View className="flex-row items-center gap-3 mt-1">
              <View className="flex-row items-center gap-1">
                <Star size={13} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-white text-sm font-semibold">{formatRating(provider.averageRating)}</Text>
                <Text className="text-white/70 text-xs">({provider.reviewCount} avis)</Text>
              </View>
              {provider.city && (
                <View className="flex-row items-center gap-1">
                  <MapPin size={13} color="rgba(255,255,255,0.8)" />
                  <Text className="text-white/80 text-xs">{provider.city}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row bg-white border-b border-gray-100">
          {[
            { label: 'Expérience', value: `${provider.experience} ans` },
            { label: 'Missions', value: `${provider.completedJobs}` },
            { label: 'Services', value: `${provider.services.length}` },
          ].map((stat, i) => (
            <View key={i} className="flex-1 py-3 items-center">
              <Text className="text-lg font-bold text-gray-900">{stat.value}</Text>
              <Text className="text-xs text-gray-500">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Disponibilité */}
        <View className={`mx-4 mt-3 p-3 rounded-xl flex-row items-center gap-2 ${provider.available ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
          <View className={`h-2.5 w-2.5 rounded-full ${provider.available ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text className={`text-sm font-semibold ${provider.available ? 'text-green-700' : 'text-gray-500'}`}>
            {provider.available ? 'Disponible pour intervention' : 'Actuellement indisponible'}
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-4 mt-4 bg-gray-100 rounded-xl p-1">
          {(['services', 'about'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              className={`flex-1 py-2 rounded-lg items-center ${tab === t ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setTab(t)}
            >
              <Text className={`text-sm font-semibold ${tab === t ? 'text-gray-900' : 'text-gray-500'}`}>
                {t === 'services' ? 'Services' : 'À propos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View className="px-4 pt-3 pb-32">
          {tab === 'services' && provider.services.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="flex-row items-center bg-white rounded-2xl border border-gray-100 p-3.5 mb-2.5 shadow-sm"
              onPress={() => handleBookService(service)}
              activeOpacity={0.85}
            >
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">{service.name}</Text>
                {service.description && (
                  <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{service.description}</Text>
                )}
                {service.duration && (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Clock size={11} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">{formatDuration(service.duration)}</Text>
                  </View>
                )}
              </View>
              <View className="items-end gap-1">
                {service.price ? (
                  <Text className="text-sm font-bold text-primary">{formatPrice(service.price)}</Text>
                ) : (
                  <Badge label="Sur devis" variant="muted" />
                )}
                <ChevronRight size={14} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}

          {tab === 'about' && provider.bio && (
            <View className="bg-white rounded-2xl border border-gray-100 p-4">
              <Text className="text-sm text-gray-600 leading-6">{provider.bio}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Button
          label={provider.available ? 'Réserver' : 'Prestataire indisponible'}
          disabled={!provider.available}
          onPress={() => {
            const firstFixed = provider.services.find((s) => s.priceType === 'FIXED');
            if (firstFixed) handleBookService(firstFixed);
          }}
        />
      </View>
    </View>
  );
}
